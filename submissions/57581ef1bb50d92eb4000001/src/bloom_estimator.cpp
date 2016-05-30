#include "state.h"


struct rows_union
{
    rows_union() : i_ok(0), i_err(0), i_dict_sz(0){}
    rows_union(int row, vector<ok_err_t> &counts) : i_ok(0), i_err(0), i_dict_sz(0)
    {
        add_row(row, counts);
    }

    rows_union(const rows_union &rhs)
    {
        *this = rhs;
    }

    rows_union& operator=(const rows_union &rhs)
    {
        i_ok = rhs.i_ok;
        i_err = rhs.i_err;
        i_dict_sz = rhs.i_dict_sz;
        rows = rhs.rows;
        return *this;
    }

    void add_row(int r, vector<ok_err_t> &counts)
    {
        rows.push_back(r);
        i_ok += counts[r].i_ok;
        i_err += counts[r].i_err;
        i_dict_sz += counts[r].i_dict_sz;
    }

    string name() const
    {
        char buf[32];
        string ret = "(";
        for (unsigned i=0; i<rows.size(); ++i)
        {
            sprintf(buf, "%d", rows[i]);
            ret += buf;
            if (i+1<rows.size())
                ret += ',';
        }
        ret += ')';
        return ret;
    }

    int i_ok, i_err, i_dict_sz;
    vector<int> rows;
};

typedef vector<rows_union> rows_set;
static string name(const rows_set &rs)
{
    string ret = "[ ";
    for (unsigned i=0; i<rs.size(); ++i)
    {
        ret += rs[i].name();
        if (i+1<rs.size())
            ret += ", ";
    }
    ret += " ]";
    return ret;
}

static void rows_union_add(vector<rows_set> &u, int row, vector<ok_err_t> &counts)
{
    vector<rows_set> new_u;
    for (unsigned i=0; i<u.size(); ++i)
    {
        rows_set &rs = u[i];
        for (unsigned j=0; j<rs.size(); ++j)
        {
            rows_set r = rs;
            r[j].add_row(row, counts);
            new_u.push_back(r);
        }
        rs.push_back(rows_union(row, counts));
        new_u.push_back(rs);
    }
    if (!u.size())
    {
        u.resize(1);
        u[0].push_back(rows_union(row, counts));
    }
    else
        u.swap(new_u);
}

static int estimate_bloom(vector<ok_err_t> &test_x_counts, int *rows, int *bits, int rows_count, int total_bits, int bit_step, int row_index)
{
    if (row_index >= rows_count)
        return 0;

    vector<int> best_bits_local(rows_count);

    ok_err_t &in = test_x_counts[rows[row_index]];
    int n = in.i_dict_sz, min_match = max(in.i_err, in.i_ok);
    //int n = in.i_err + in.i_ok
    int best_total = -1;
    for (int m=0; m<=total_bits; m+=bit_step)
    {
        int count_match = min_match;
        if (m!=0)
        {
            double P = (1 - pow(exp(1), ((m*8)*log(1.0 / (pow(2.0, log(2.0))))) / n));
            count_match = in.i_ok + (int)(in.i_err*P);
            if (count_match <= min_match)
                continue;
        }
        int other = estimate_bloom(test_x_counts, rows, &best_bits_local[0], rows_count, total_bits-m, bit_step, row_index+1);
        if (other+count_match > best_total)
        {
            best_total = other+count_match;
            bits[row_index] = m;
            for (int i=row_index+1; i<rows_count; ++i)
                bits[i] = best_bits_local[i];
        }
    }
    return best_total;
}

static int estimate_bloom(rows_set &rows, int *bits, int total_bits, int bit_step, int row_index)
{
    if (row_index >= (int)rows.size())
        return 0;

    vector<int> best_bits_local(rows.size());

    rows_union &in = rows[row_index];
    int n = in.i_dict_sz, min_match = max(in.i_err, in.i_ok);
    //int n = in.i_err + in.i_ok
    int best_total = -1;
    for (int m=0; m<=total_bits; m+=bit_step)
    {
        int count_match = min_match;
        if (m!=0)
        {
            double P = (1 - pow(exp(1), ((m*8)*log(1.0 / (pow(2.0, log(2.0))))) / n));
            count_match = in.i_ok + (int)(in.i_err*P);
            if (count_match <= min_match)
                continue;
        }
        int other = estimate_bloom(rows, &best_bits_local[0], total_bits-m, bit_step, row_index+1);
        if (other+count_match > best_total)
        {
            best_total = other+count_match;
            bits[row_index] = m;
            for (int i=row_index+1; i<(int)rows.size(); ++i)
                bits[i] = best_bits_local[i];
        }
    }
    return best_total;
}

static void build_rows(vector<rows_set> &u, vector<ok_err_t> &counts, int *rows, int rows_count)
{
    u.clear();
    scoped_timer st2;
    for (int i=0; i<rows_count; ++i)
        rows_union_add(u, rows[i], counts);
}

int estimate_bloom(vector<ok_err_t> &counts, int *rows, int rows_count, int total_bits, int bit_step)
{
    scoped_timer st2;
    vector<rows_set> u;
    build_rows(u, counts, rows, rows_count);

    int best_total = -1;
    vector<int> best_bits;
    rows_set best_set;

#pragma omp parallel for
    for (int i=0; i<(int)u.size(); ++i)
    {
        rows_set &rs = u[i];
        vector<int> best_bits_local2(rs.size());
        int other = estimate_bloom(rs, &best_bits_local2[0], total_bits, bit_step, 0);

        if (other > best_total || (other == best_total && best_set.size() > rs.size()))
        {
            best_total = other;
            best_bits.swap(best_bits_local2);
            best_set = rs;
        }
    }
    printf("\nbest combination:\n");
    for (unsigned i=0; i<best_set.size(); ++i)
    {
        printf("\t%15s : [ dict:%d, bytes:%d ]\n", best_set[i].name().c_str(), best_set[i].i_dict_sz, best_bits[i]);
    }
    printf("\n"); 
    return best_total;
}
