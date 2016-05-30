// ConsoleApplication2.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"

#include "params.h"

#define BLOOM_FILTER_BIT_SIZE ( BLOOM_FILTER_SIZE * 8 )
//unsigned char bloom_filter[ BLOOM_FILTER_SIZE ] = { 0 };

const char * alphabet = "abcdefghijklmnopqrstuvwxyz'$";
int alphabet_length = strlen( alphabet );

void strtolower( std::string & s ) {
  std::transform(s.begin(), s.end(), s.begin(), ::tolower);
}

void strtoupper( std::string & s ) {
  std::transform(s.begin(), s.end(), s.begin(), ::toupper);
}

using std::cout;

bool do_replace(std::string& str, const std::string& from, const std::string& to) {
    size_t start_pos = str.find(from);
    if(start_pos == std::string::npos)
        return false;
    str.replace(start_pos, from.length(), to);
    return true;
}

void str_replace(std::string& str, const std::string& from, const std::string& to) {
  while ( do_replace( str, from, to ) );
}

void str_replace(std::string& str, const std::string& from, const char * to_) {
  string to( to_ );
  while ( do_replace( str, from, to ) );
}

void str_replace(std::string& str, const char * from_, const char * to_) {
  string to( to_ );
  string from( from_ );
  while ( do_replace( str, from, to ) );
}

void explode( const std::string delimiter, const std::string & str, string_array & arr ) {
  arr.clear();
  size_t strleng = str.length();
  size_t delleng = delimiter.length();
  if (delleng==0)
      return;//no change
 
  size_t i=0;
  size_t k=0;
  while( i<strleng )
  {
      size_t j=0;
      while (i+j<strleng && j<delleng && str[i+j]==delimiter[j])
          j++;
      if (j==delleng)//found delimiter
      {
          arr.push_back(  str.substr(k, i-k) );
          i+=delleng;
          k=i;
      }
      else
      {
          i++;
      }
  }
  arr.push_back(  str.substr(k, i-k) );
}

typedef set < string > string_set;
typedef map < string, string > string_map;

std::string strval( double d, char precision ) {
  std::stringstream ss;
  if ( precision != -1 ) {
    ss.precision( precision );
  }
  ss << std::fixed;
  ss << d;
  string result;
  ss >> result;
  return result;
}

unsigned long long int ref_id;

typedef set < unsigned long long int > t_int_set;

typedef multimap < double, char > t_correlation_stats_by_prev_char;
class CCorrelationStats {
public:
  string s;
  string from;
  string to;
  t_correlation_stats_by_prev_char delta_by_prev_char;
  t_correlation_stats_by_prev_char p_by_prev_char;
//  t_correlation_ref_by_prev_char ref_by_prev_char;
  double delta = 0;
  bool direction = false;
};
typedef multimap < double, CCorrelationStats * > t_correlation_stats;
typedef map < string, CCorrelationStats * > t_correlation_stats_by_name;

class CDeltaErrorData {
public:
  double Nxy_dict = 0;
  double Nx_dict = 0;
  double Ny_dict = 0;
  //double Nxy_sample = 0;
  double Nx_sample = 0;
  double Ny_sample = 0;
  double Nx_sample_dict = 0;
  double Ny_sample_dict = 0;
  unsigned long long int suffix_length;
  double P_bloom_fail_without_x = 0;
  //double P_input_x = 0;
  double P_input_x_dict = 0;
};

double N_sample_bloom = N_sample_nondict_bloom + N_sample_dict_bloom;
double P_sample_nondict_bloom = N_sample_nondict_bloom / N_sample_bloom;
double P_sample_dict_bloom = N_sample_dict_bloom / N_sample_bloom;
double P_sample_nondict_bloom_positive = N_sample_nondict_bloom_positive / N_sample_dict_bloom;
double k_bloom = P_sample_nondict_bloom * ( 1 - P_sample_nondict_bloom_positive );
double k_bloom2 = P_sample_nondict_bloom * P_sample_nondict_bloom_positive;

double P_bloom_fail_( double N, double bit_size = BLOOM_FILTER_BIT_SIZE ) {
  //double P_bloom_fail = ( ( double )1 - pow( ( double )1 - ( double )1 / ( double )BLOOM_FILTER_BIT_SIZE, N_bloom ) ) * P_sample_nondict_bloom;
  return ( ( double )1 - exp( -N / bit_size ) ) * k_bloom + k_bloom2;
}

double P_bloom_fail = P_bloom_fail_( N_bloom );
double P_bloom_fail_one_word_less = P_bloom_fail_( N_bloom - 1 );
double P_bloom_fail_one_word_delta = P_bloom_fail - P_bloom_fail_one_word_less;
double P_sample_single_dict_word = P_sample_dict_bloom / N_dict;

double calculate_delta_error( CDeltaErrorData & data ) {
  if ( data.P_bloom_fail_without_x == 0 ) {
    data.P_bloom_fail_without_x = P_bloom_fail_( N_bloom - data.Nx_dict );
  }
  /*
  if ( data.P_input_x == 0 ) {
    data.P_input_x = data.Nx_sample / N_sample_bloom;
  }
  */
  if ( data.P_input_x_dict == 0 ) {
    data.P_input_x_dict = data.Nx_sample_dict / N_sample_bloom;
  }
  double P_fail_xy = ( data.Nx_dict - data.Nxy_dict ) / data.Nx_dict;
  double P_bloom_fail_xy = data.P_bloom_fail_without_x + data.P_input_x_dict * P_fail_xy;
  double delta_error = P_bloom_fail - P_bloom_fail_xy;
  return delta_error;
}

void add_transformations_from_string( string s, bool bFromStart ) {
  string_array arr;
  explode( ")", s, arr );
  for ( string_array::iterator i = arr.begin(); i != arr.end(); i++ ) {
    if ( !i->empty() ) {
      string_array arr;
      explode( " ", *i, arr );
      explode( ",", string( arr[ 0 ] ), arr );
      CTransformation * p = new CTransformation();
      p->from = arr[ 0 ];
      p->to = arr[ 1 ];
      p->exceptions = arr[ 2 ];
      p->bFromStart = bFromStart;
      p->counter = atoll( arr[ 3 ].c_str() );
      p->fail_counter = atoll( arr[ 4 ].c_str() );
      int length = 0;
      length += p->from.length();
      length += p->to.length();
      length += p->exceptions.length();
      //p->fail_delta = P_bloom_fail_( N_bloom, BLOOM_FILTER_BIT_SIZE ) - P_bloom_fail_( N_bloom - p->counter, BLOOM_FILTER_BIT_SIZE - length * 8 );
      p->fail_delta = P_bloom_fail_( N_bloom, BLOOM_FILTER_BIT_SIZE ) - P_bloom_fail_( N_bloom - p->counter, BLOOM_FILTER_BIT_SIZE );
      p->fail_delta -= p->fail_counter / N_dict;
      double fail_rate = double( p->fail_counter ) / double( p->counter );
      if ( ( 
        //p->fail_delta > 0 && 
        p->counter > transformations_counter_limit
        && fail_rate < transformations_failrate_limit
        && p->fail_counter < transformations_fail_limit
      ) ) {
        transformations.push_back( p );
        transformations_length += length;
      }
    }
  }
}

//bool bReverse = false;
//bool bReverse = true;

#define DICTIONARY_FILENAME "./bloom_words.txt"
//#define DICTIONARY_FILENAME "./words_.txt"

typedef map < string, unsigned long long int > t_weighted_strings;

int nonpairs_buffer_size = 3 * 27 * 27 / 8 + 1;

unsigned int permutation_table[ 256 ] = { 0 };

static mutex * fill_permutation_table_access( new mutex );

void fill_permutation_table() {
  // LCG-PRNG-based permutation table filler
  lock_guard < mutex > g( *fill_permutation_table_access );
  unsigned int m = 256;
  unsigned int c = 5;
  unsigned int a = 3;
  unsigned int value = 3;
  set < unsigned int > existing;
  for ( unsigned int i = 0; i < m; i++ ) {
    value = ( a * value + c ) % m;
    while ( existing.find( value ) != existing.end() ) {
      value = ( value + 1 ) % m;
    }
    existing.insert( value );
    permutation_table[ i ] = value;
  }
}

unsigned int pearson_hash32( string s ) {
  if ( permutation_table[ 0 ] == 0 ) {
    fill_permutation_table();
  }
  unsigned int result = 0;
  for ( unsigned int iteration_number = 0; iteration_number < 4; iteration_number++ ) {
    unsigned int iteration_result = 0;
    int length = s.length();
    for ( unsigned int i = 0; i < length; i++ ) {
      iteration_result = permutation_table[ iteration_result ^ ( int )( s[ i ] ) ];
    }
    result += ( iteration_result << ( iteration_number << 3 ) );
    s[ 0 ] += 1;
  }
  return result;
}

int word_limit = 15;

  typedef map < string, int > t_precheck_map;
  static t_precheck_map precheck_map;
static string_set total_non_pairs;
static string_set starting_non_pairs;
static string_set ending_non_pairs;

int start_counter = 0;
int end_counter = 0;
int total_counter = 0;

void precheck( string & s, int & result, mutex & access ) {

  t_precheck_map::iterator cached;

  {
    lock_guard < mutex > g( access );
    cached = precheck_map.find( s );
  }

  if ( cached == precheck_map.end() ) {

    {
      lock_guard < mutex > g( access );
      if ( total_non_pairs.size() == 0 ) {
        unsigned char * nonpairs_buffer = new unsigned char[ nonpairs_buffer_size ]();
        ifstream is( "./nonpairs.txt", ios::binary );
        is.read( ( char * )&( nonpairs_buffer[ 0 ] ), nonpairs_buffer_size );
        for ( unsigned char i = 'a'; i <= '{'; i++ ) {
          for ( unsigned char k = 'a'; k <= '{'; k++ ) {
            string s;
            s += i;
            s += k;
            int bit_pos = int( i - 'a' ) * 27 + int( k - 'a' );
            if ( nonpairs_buffer[ bit_pos / 8 ] & ( 1 << ( bit_pos % 8 ) ) ) {
              total_non_pairs.insert( s );
            }
            bit_pos += 27 * 27;
            if ( nonpairs_buffer[ bit_pos / 8 ] & ( 1 << ( bit_pos % 8 ) ) ) {
              starting_non_pairs.insert( s );
            }
            bit_pos += 27 * 27;
            if ( nonpairs_buffer[ bit_pos / 8 ] & ( 1 << ( bit_pos % 8 ) ) ) {
              ending_non_pairs.insert( s );
            }
          }
        }
      }
    }

    bool bSkip = false;
    if ( s.length() == 0 ) {
      // zero length is a nonword
      bSkip = true;
      result = 0;
    }
    if ( s.length() == 1 && s[ 0 ] != '\'' ) {
      // all one-letter words exist except for "'"
      bSkip = true;
      result = 1;
    }
    if ( s.length() > word_limit ) {
      // 25+ letter words are considered nonwords
      bSkip = true;
      result = 0;
    }
    if ( !bSkip ) {
      int first_pos = s.find_first_of( '\'' );
      int last_pos = s.find_last_of( '\'' );
      if ( 
        ( first_pos > 0 && first_pos != 1 && first_pos != 2 && first_pos != s.length() - 2 )
        ||
        last_pos != first_pos
      ) {
        bSkip = true;
        result = 0;
      }
    }
    /*
    if ( last_pos > 0 && last_pos != s.length() - 2 ) {
      bSkip = true;
    }
    */
    if ( !bSkip ) {
      int consonant_count = 0;
      int vowel_count = 0;
      for ( int i = s.length(); i > 0; ) {
        i--;
        if ( strchr( "aeiouy'", s[ i ] ) == NULL ) {
          vowel_count = 0;
          consonant_count++;
          if ( consonant_count >= 5 ) {
            bSkip = true;
            result = 0;
            break;
          }
        } else {
          consonant_count = 0;
          vowel_count++;
          /*
          if ( vowel_count >= 4 ) {
            bSkip = true;
            result = 0;
            break;
          }
          */
        }
      }
    }
    if ( !bSkip ) {
      string s_np( s );
      std::replace( s_np.begin(), s_np.end(), '\'', '{' );
      bool bStartFound = false;
      bool bEndFound = false;
      bool bTotalFound = false;
      if ( 
        !bSkip && s_np.length() >= 2
        &&
        (
          ( bStartFound = starting_non_pairs.find( s_np.substr( 0, 2 ) ) != starting_non_pairs.end() )
          ||
          ( bEndFound = ending_non_pairs.find( s_np.substr( s_np.length() - 2 ) ) != ending_non_pairs.end() )
        )
      ) {
        if ( bStartFound ) {
          start_counter++;
        }
        if ( bEndFound ) {
          end_counter++;
        }
        bSkip = true;
        result = 0;
      }
      if ( !bSkip && s_np.length() >= 2 ) {
        for ( int i = s_np.length() - 1; !bSkip && i > 0; ) {
          i--;
          if ( total_non_pairs.find( s_np.substr( i, 2 ) ) != total_non_pairs.end() ) {
            total_counter++;
            bSkip = true;
            result = 0;
          }
        }
      }
    }
    if ( !bSkip && s.length() == 2 ) {
      // two letter words are checked by nonpairs
      bSkip = true;
      result = 1;
    }

    lock_guard < mutex > g( access );
    precheck_map[ s ] = result;

  } else {
    result = cached->second;
  }
}

static string_map permanent_transformations;
static map < string, bool > transformed_map;
static map < string, int > result_map;

//ofstream os( "./2.txt" );

bool bCheckTransform = false;
//bool bCheckTransform = true;
string_set dictionary;

void transform( string & s, bool & bTransformed, bool & bTransformedByTemporary, int & result, mutex & access ) {

  bTransformed = false;
  bTransformedByTemporary = false;
  result = 2;
  precheck( s, result, access );
  if ( result == 2 ) {
    /*
    if ( strstr( s.c_str(), "antia" ) == s.c_str() ) {
      s.c_str();
    }
    */
    for ( bool bTemporary = false; ; bTemporary++ ) {
      string s_( s );
      string_map::iterator permanent_transformation;
      bool bPrecomputed = false;
      bool bRecomputed = false;
      if ( !bTemporary ) {
        {
          lock_guard < mutex > g( access );
          permanent_transformation = permanent_transformations.find( s );
        }
        if ( permanent_transformation != permanent_transformations.end() ) {
          bPrecomputed = true;
          s = permanent_transformation->second;
          bTransformed = transformed_map[ permanent_transformation->first ];
          result = result_map[ permanent_transformation->first ];
        }
      }
      for ( t_transformations::iterator transformation = transformations.begin(); /*!bSkip &&*/ transformation != transformations.end(); transformation++ ) {
        if ( !bPrecomputed || ( *transformation )->bNew ) {
          if ( bTemporary == ( *transformation )->bTemporary ) {
            string positive;
            /*
            if ( strstr( s.c_str(), "antia" ) == s.c_str() && ( *transformation )->from == "anti" ) {
              s.c_str();
            }
            */
            if ( ( *transformation )->bFromStart ) {
              if ( 
                s.length() > ( *transformation )->from.length()
                &&
                s.substr( 0, ( *transformation )->from.length() ) == ( *transformation )->from
                &&
                (
                  ( *transformation )->exceptions.c_str()[ 0 ] == '\0'
                  ||
                  (
                    ( *transformation )->exceptions.c_str()[ 0 ] >= 'a'
                    &&
                    strchr( ( *transformation )->exceptions.c_str(), s[ ( *transformation )->from.length() ] ) == NULL
                  )
                  ||
                  (
                    ( *transformation )->exceptions.c_str()[ 0 ] < 'a'
                    &&
                    strchr( ( *transformation )->exceptions.c_str(), s[ ( *transformation )->from.length() ] - 32 ) != NULL
                  )
                )
              ) {
                positive = ( *transformation )->to + s.substr( ( *transformation )->from.length() );
              }
            } else {
              long long int delta_length = s.length() - ( *transformation )->from.length();
              if ( 
                delta_length > 0 
                &&
                s.substr( delta_length ) == ( *transformation )->from
                &&
                (
                  ( *transformation )->exceptions.c_str()[ 0 ] == '\0'
                  ||
                  (
                    ( *transformation )->exceptions.c_str()[ 0 ] >= 'a'
                    &&
                    strchr( ( *transformation )->exceptions.c_str(), s[ delta_length - 1 ] ) == NULL
                  )
                  ||
                  (
                    ( *transformation )->exceptions.c_str()[ 0 ] < 'a'
                    &&
                    strchr( ( *transformation )->exceptions.c_str(), s[ delta_length - 1 ] - 32 ) != NULL
                  )
                )
              ) {
                positive = s.substr( 0, delta_length ) + ( *transformation )->to;
              }
            }
            if ( !positive.empty() ) {
              /*
              if ( strstr( s.c_str(), "antia" ) == s.c_str() ) {
                s.c_str();
              }
              */
              ( *transformation )->counter++;
              if ( bCheckTransform ) {
                if ( dictionary.find( positive ) == dictionary.end() ) {
                  ( *transformation )->fail_counter++;
                }
              }
              s = positive;
              bTransformed = true;
              bRecomputed = true;
              if ( bTemporary ) {
                bTransformedByTemporary = true;
              }
            }
          }
        }
      }
      if ( !bTemporary && bRecomputed ) {
        lock_guard < mutex > g( access );
        permanent_transformations[ s_ ] = s;
        transformed_map[ s_ ] = bTransformed;
        result_map[ s_ ] = result;
      }
      if ( bTemporary ) {
        break;
      }
    }
    /*
    if ( strstr( s.c_str(), "antia" ) == s.c_str() ) {
      s.c_str();
    }
    */
    if ( s.length() < 3 ) {
      // the word after transformation is too short
      result = 0;
    }
    if ( bTransformed && result == 2 ) {
      precheck( s, result, access );
    }
    /*
    if ( result == 2 ) {
      lock_guard < mutex > g( access );
      os << s << "\n";
    }
    */
  }
}

unsigned int get_hash( const string & s ) {
  static mutex access;
  typedef map < string, unsigned int > t_hashes;
  static t_hashes hashes;
  unsigned int hash;
  t_hashes::iterator h;
  {
    lock_guard < mutex > g( access );
    h = hashes.find( s );
  }
  if ( h == hashes.end() ) {
    string s_( s );
    std::replace( s_.begin(), s_.end(), '\'', '{' );
    hash = pearson_hash32( s_ );
    hash %= BLOOM_FILTER_BIT_SIZE;
    lock_guard < mutex > g( access );
    hashes[ s ] = hash;
  } else {
    hash = h->second;
  }
  return hash;
}

class bloom_data {
public:
  mutex access;
  string_set bloom_words;
  t_weighted_strings conversion_needed_items;
  t_weighted_strings conversion_removed_items;
};

void bloom_worker( int id, bloom_data * d, string s ) {
  strtolower( s );
  string s_( s );
  int result = 0;
  bool bTransformed = false;
  bool bTransformedByTemporary = false;
  transform( s, bTransformed, bTransformedByTemporary, result, d->access );
  if ( bTransformed ) {
    lock_guard < mutex > g( d->access );
    // dictionary word is transformed
    d->conversion_removed_items[ s_ ]++;
    // dictionary word is expected to exist
    d->conversion_needed_items[ s ]++;
    result = 0;
  }
  if ( result == 2 ) {
    lock_guard < mutex > g( d->access );
    d->bloom_words.insert( s );
  }
}

#define WORK_QUEUE_DEPTH 200

void bloom( bool bTerminate = true ) {

  ctpl::thread_pool threads( thread::hardware_concurrency() );

  init_transformations();

  unsigned char * bloom_filter = new unsigned char[ BLOOM_FILTER_SIZE ]();

  bloom_data d;

  if ( bCheckTransform ) {
    ifstream is( "./words.txt" );
    while ( !is.eof() ) {
      string s;
      is >> s;
      dictionary.insert( s );
    }
  }

  //ifstream is( DICTIONARY_FILENAME );
  ifstream is( "./words.txt" );
  while ( !is.eof() ) {
    string s;
    is >> s;
    threads.wait_idle( -WORK_QUEUE_DEPTH );
    threads.push( bloom_worker, &d, s );
  }
  threads.stop( true );
  for ( t_weighted_strings::iterator removed = d.conversion_removed_items.begin(); removed != d.conversion_removed_items.end(); removed++ ) {
    t_weighted_strings::iterator needed( d.conversion_needed_items.find( removed->first ) );
    if ( needed != d.conversion_needed_items.end() ) {
      // restore useful dictionary words
      // the word is useful when false positive decrease is less than false negative increase if this word is removed
      double error_decrease = double( removed->second ) * P_bloom_fail_one_word_delta;
      double error_increase = ( 1 - P_bloom_fail_one_word_less ) * double( needed->second ) * P_sample_single_dict_word;
      if ( error_decrease < error_increase ) {
        d.bloom_words.insert( removed->first );
      }
    }
  }
  {
    //ofstream os( DICTIONARY_FILENAME );
    for ( string_set::iterator i = d.bloom_words.begin(); i != d.bloom_words.end(); i++ ) {
      unsigned int hash = get_hash( *i );
      unsigned int byte_pos = hash / 8;
      bloom_filter[ byte_pos ] |= ( 1 << ( hash % 8 ) );
    }
  }
  {
    ofstream os3( "./bloom.txt", ios::binary );
    os3.write( ( char * )bloom_filter, BLOOM_FILTER_SIZE );
  }
  {
    ofstream os2( "./bloom_bits.txt" );
    for ( unsigned int i = 0; i < BLOOM_FILTER_BIT_SIZE; i++ ) {
      unsigned int byte_pos = i / 8;
      os2 << ( ( bloom_filter[ byte_pos ] & ( 1 << ( i % 8 ) ) ) ? 1 : 0 );
    }
  }

  /* character range denotes field type */
  /* 0-64 - exceptions */
  /* 65-128 - from (except for 1st letter) */
  /* 129-192 - to */
  /* 193-224 - new item start, first letter of from for suffix replacement */
  /* 225-255 - new item start, first letter of from for prefix replacement */
  {
    ofstream os( "./transformations.dat", ios::binary );
    string s;
    for ( t_transformations::iterator transformation = transformations.begin(); transformation != transformations.end(); transformation++ ) {
      if ( ( *transformation )->bFromStart ) {
        reverse( ( *transformation )->from.begin(), ( *transformation )->from.end() );
        reverse( ( *transformation )->to.begin(), ( *transformation )->to.end() );
      }
      do_replace( ( *transformation )->from, "\'", "{" );
      s.clear();
      for ( int i = 0; i < ( *transformation )->from.length(); i++ ) {
        s += char( ( *transformation )->from[ i ] + ( i == 0 ? ( ( *transformation )->bFromStart ? 128 : 96 ) : 0 ) );
      }
      os << s;
      s.clear();
      for ( int i = 0; i < ( *transformation )->exceptions.length(); i++ ) {
        s += char( ( *transformation )->exceptions[ i ] - 64 );
      }
      os << s;
      do_replace( ( *transformation )->to, "\'", "{" );
      s.clear();
      for ( int i = 0; i < ( *transformation )->to.length(); i++ ) {
        s += char( ( *transformation )->to[ i ] + 64 );
      }
      os << s;
    }
  }

  if ( bCheckTransform ) {
    ofstream os_s( "./suffixes.txt" );
    ofstream os_p( "./prefixes.txt" );
    for ( t_transformations::iterator i = transformations.begin(); i != transformations.end(); i++ ) {
      ofstream & os( ( *i )->bFromStart ? os_p : os_s );
      string from( ( *i )->from );
      string to( ( *i )->to );
      if ( ( *i )->bFromStart ) {
        reverse( from.begin(), from.end() );
        reverse( to.begin(), to.end() );
      }
      os << from << "," << to << "," << ( *i )->exceptions << "," << ( *i )->counter << "," << ( *i )->fail_counter << ")\\\n";
    }
  }

  if ( bTerminate ) ::TerminateProcess( ::GetCurrentProcess(), 0 );
  delete [] bloom_filter;
}

class iterative_bloom_data {
public:
  mutex access;
  string_set bloom_words;
  t_weighted_strings conversion_needed_items;
  string_set conversion_removed_items;
  bool bRecalculateForcedItems = false;
  unsigned char * bloom_filter;
};

void iterative_bloom_worker( int id, iterative_bloom_data * d, string s ) {
  string s_( s );
  int result = 0;
  bool bTransformed = false;
  bool bTransformedByTemporary = false;
  transform( s_, bTransformed, bTransformedByTemporary, result, d->access );
  if ( bTransformed ) {
    if ( 0 && bTransformedByTemporary ) {
      //temp_conversion_removed_items.insert( *i );
      //temp_conversion_needed_items[ s_ ]++;
    } else {
      lock_guard < mutex > g( d->access );
      // dictionary word is transformed
      d->conversion_removed_items.insert( s );
      // dictionary word is expected to exist
      d->conversion_needed_items[ s_ ]++;
      d->bRecalculateForcedItems = true;
    }
  }
  if ( !bTransformed && result == 2 ) {
    unsigned int hash = get_hash( s_ );
    unsigned int byte_pos = hash / 8;
    lock_guard < mutex > g( d->access );
    d->bloom_filter[ byte_pos ] |= ( 1 << ( hash % 8 ) );
  }
}

void iterative_bloom( unsigned char bloom_filter [] ) {

  ctpl::thread_pool threads( thread::hardware_concurrency() );

  init_transformations();

  static string_set words;
  static string_map permanent_words;

  static string_set forced_items;

  t_weighted_strings temp_conversion_needed_items;
  string_set temp_conversion_removed_items;

  if ( words.size() == 0 ) {
    //ifstream is( DICTIONARY_FILENAME );
    ifstream is( "./words.txt" );
    while ( !is.eof() ) {
      string s;
      is >> s;
      strtolower( s );
      words.insert( s );
    }
  }

  iterative_bloom_data d;
  d.bloom_filter = bloom_filter;

  d.bRecalculateForcedItems = false;

  for ( string_set::iterator i = words.begin(); i != words.end(); i++ ) {
    /*
    if ( *i == "abating" ) {
      ( *i ).c_str();
    }
    */
    if ( d.conversion_removed_items.find( *i ) == d.conversion_removed_items.end() ) {
      threads.wait_idle( -WORK_QUEUE_DEPTH );
      threads.push( iterative_bloom_worker, &d, *i );
    }
  }
  threads.stop( true );

  //forced_items

  if ( d.bRecalculateForcedItems ) {
    forced_items.clear();
    for ( string_set::iterator removed = d.conversion_removed_items.begin(); removed != d.conversion_removed_items.end(); removed++ ) {
      t_weighted_strings::iterator needed( d.conversion_needed_items.find( *removed ) );
      if ( needed != d.conversion_needed_items.end() ) {
        // restore useful dictionary words
        // the word is useful when false positive decrease is less than false negative increase if this word is removed
        double error_decrease = P_bloom_fail_one_word_delta;
        double error_increase = ( 1 - P_bloom_fail_one_word_less ) * double( needed->second ) * P_sample_single_dict_word;
        if ( error_decrease < error_increase ) {
          forced_items.insert( *removed );
        }
      }
    }
  }

  //if(0)
  for ( string_set::iterator removed = forced_items.begin(); removed != forced_items.end(); removed++ ) {
    unsigned int hash = get_hash( *removed );
    unsigned int byte_pos = hash / 8;
    bloom_filter[ byte_pos ] |= ( 1 << ( hash % 8 ) );
  }

}

class check_bloom_worker_data {
public:
  mutex access;
  unsigned long long int counter = 0;
  unsigned long long int match_counter = 0;
  unsigned long long int confirmed_positive = 0;
  unsigned long long int confirmed_negative = 0;
  unsigned long long int false_positive = 0;
  unsigned long long int false_negative = 0;
  unsigned char * bloom_filter = NULL;
};

void check_bloom_worker( int id, check_bloom_worker_data * d, string s, bool bShouldMatch ) {
  bool bMatch = false;
  int result = 0;
  bool bTransformed = false;
  bool bTransformedByTemporary = false;
  //string s_( s );
  /*
  if ( s == "aardvark's" ) {
    s.c_str();
  }
  */
  transform( s, bTransformed, bTransformedByTemporary, result, d->access );
  if ( result == 0 ) {
    bMatch = false;
  } else if ( result == 1 ) {
    bMatch = true;
  } else {
    unsigned int hash = get_hash( s );
    unsigned int byte_pos = hash / 8;
    if ( d->bloom_filter[ byte_pos ] & ( 1 << ( hash % 8 ) ) ) {
      bMatch = true;
    } else {
      //cout << *i << " - fail\n";
    }
  }
  lock_guard < mutex > g( d->access );
  if ( bMatch ) { 
    d->match_counter++;
    if ( !bShouldMatch ) {
      d->false_positive++;
    } else {
      d->confirmed_positive++;
    }
  } else {
    if ( !bShouldMatch ) {
      d->confirmed_negative++;
    } else {
      //os << s_ << "\n";
      d->false_negative++;
    }
  }
  d->counter++;
}

double do_check_bloom( unsigned char bloom_filter [], bool bTrace = true ) {

  ctpl::thread_pool threads( thread::hardware_concurrency() );

  init_transformations();

  typedef map < string, bool > t_test_data;
  static t_test_data test_data;

  if ( test_data.size() == 0 ) {
    ifstream is( "./test_data_original_.json" );
    //ofstream os( "./false_positive.txt" );
    while ( !is.eof() && is.good() ) {
      string s;
      getline( is, s );
      if ( s.length() > 0 && s != "{" && s != "}" ) {
        strtolower( s );
        string_array arr;
        explode( ": ", s, arr );
        arr[ 1 ].erase( arr[ 1 ].find_last_not_of(",") + 1 );
        arr[ 0 ].erase( 0, arr[ 0 ].find_first_not_of(" \"") );
        arr[ 0 ].erase( arr[ 0 ].find_last_not_of(" \"") + 1 );
        test_data[ arr[ 0 ] ] = ( arr[ 1 ] == "true" );
      }
    }
  }

  check_bloom_worker_data d;
  d.bloom_filter = bloom_filter;
  {
    for ( t_test_data::iterator i = test_data.begin(); i != test_data.end(); i++ ) {
      threads.wait_idle( -WORK_QUEUE_DEPTH );
      threads.push( check_bloom_worker, &d, i->first, i->second );
    }
  }
  threads.stop( true );
  double total_error = double( d.false_positive + d.false_negative ) / double( d.counter );
  if ( bTrace ) {
    cout << "Transformations count: " << transformations.size() << "\n";
    cout << "Transformations length: " << transformations_length << "\n";
    cout << "Transformations counter limit: " << transformations_counter_limit << "\n";
    cout << "Transformations fail limit: " << transformations_fail_limit << "\n";
    cout << "Transformations fail rate limit: " << transformations_failrate_limit << "\n";
    cout << "Total: " << d.counter << 
      "\nMatch: " << double( d.match_counter ) / double( d.counter ) << " (" << d.match_counter << 
      ")\nConfirmed positive: " << double( d.confirmed_positive ) / double( d.counter ) << " ("  << d.confirmed_positive << 
      ")\nConfirmed negative: " << double( d.confirmed_negative ) / double( d.counter ) << " ("  << d.confirmed_negative << 
      ")\nFalse positive: " << double( d.false_positive ) / double( d.counter ) << " ("  << d.false_positive << 
      ")\nFalse negative: " << double( d.false_negative ) / double( d.counter ) << " ("  << d.false_negative <<
      ")\nTotal error: " << total_error << " ("  << d.false_positive + d.false_negative << ")\n";
  }

  return total_error;
}

double check_bloom( bool bTrace = true ) {

  unsigned long long int file_size = 0;
  {
    ifstream is( "./bloom.txt", ios::binary | ios::ate );
    file_size = is.tellg();
  }
  unsigned char * bloom_filter = new unsigned char [ file_size ]();
  {
    ifstream is( "./bloom.txt", ios::binary );
    is.read( ( char * )&( bloom_filter[ 0 ] ), file_size );
  }
  double result = do_check_bloom( bloom_filter, bTrace );
  ::TerminateProcess( ::GetCurrentProcess(), 0 );
  return result;
}

double check_bloom_iteration( bool bTrace ) {
  start_counter = 0;
  end_counter = 0;
  total_counter = 0;
  double result = 1;
  {
    unsigned char bloom_filter[ BLOOM_FILTER_SIZE ] = { 0 };
    iterative_bloom( bloom_filter );
    result = do_check_bloom( bloom_filter, bTrace );
    for ( t_transformations::iterator transformation = transformations.begin(); transformation != transformations.end(); transformation++ ) {
      ( *transformation )->bNew = false;
    }
  }
  /*
  {
    unsigned char bloom_filter[ BLOOM_FILTER_SIZE ] = { 0 };
    iterative_bloom( bloom_filter );
    result = do_check_bloom( bloom_filter, false );
  }
  */
  return result;
}

void iterate_bloom( bool bReverse ) {

  init_transformations();

  typedef multimap < double, char > t_partial_impovements;

  double base_error = check_bloom_iteration( false );
  cout << "Base error: " << base_error << "\n";

  {
    ifstream is( bReverse ? "./correlation_results_rev.txt" : "./correlation_results.txt" );
    string s;
    getline( is, s );
    while ( !is.eof() ) {
      if ( s.length() > 0 ) {
        string_array arr;
        explode( " ", s, arr );
        string from( arr[ 0 ] );
        string to( arr[ 2 ] );
        double error = stod( arr[ 3 ].substr( 1, arr[ 3 ].length() - 2 ) );
        cout << s << "\n";
        getline( is, s );
        t_partial_impovements partial_impovements;
        while ( !is.eof() && s.length() > 0 && s[ 0 ] == ' ' ) {
          string_array arr;
          explode( " ", s, arr );
          partial_impovements.insert( t_partial_impovements::value_type( stod( arr[ 5 ].substr( 1, arr[ 5 ].length() - 2 ) ), bReverse ? arr[ 2 ][ arr[ 2 ].length() - 1 ] : arr[ 2 ][ 0 ] ) );
          cout << s << "\n";
          getline( is, s );
        }
        if ( !bReverse && to.length() >= 2 && to.substr( to.length() - 2 ) == "'s" ) {
          cout << "('s)" << "\n";
          to = to.substr( 0, to.length() - 2 );
        }
        if ( from == to ) {
          cout << "  XXXX" << "\n";
        } else {
          double no_exceptions_error = 1;
          {
            CTransformation * p = new CTransformation();
            p->bTemporary = true;
            p->from = from;
            p->to = to;
            p->bFromStart = bReverse;
            transformations.push_back( p );
            //unsigned char bloom_filter[ BLOOM_FILTER_SIZE ] = { 0 };
            no_exceptions_error = check_bloom_iteration( false );
            cout << "    " << no_exceptions_error << "\n";
            transformations.pop_back();
            delete p;
          }
          double inclusion_exceptions_error = 1;
          string inclusion_exceptions;
          t_partial_impovements::iterator i;
          bool bLetterBack = false;
          for ( i = partial_impovements.end(); i != partial_impovements.begin(); ) {
            i--;
            inclusion_exceptions += i->second - 32;
            CTransformation * p = new CTransformation();
            p->bTemporary = true;
            p->from = from;
            p->to = to;
            p->exceptions = inclusion_exceptions;
            p->bFromStart = bReverse;
            transformations.push_back( p );
            double current_error = check_bloom_iteration( false );
            cout << "    " << inclusion_exceptions << ": " << current_error << "\n";
            transformations.pop_back();
            delete p;
            if ( current_error >= base_error ) {
              inclusion_exceptions.pop_back();
              bLetterBack = true;
              break;
            }
            if ( current_error <= inclusion_exceptions_error ) {
              inclusion_exceptions_error = current_error;
            } else {
              inclusion_exceptions.pop_back();
              bLetterBack = true;
              break;
            }
          }
          double exclusion_exceptions_error = 1;
          string exclusion_exceptions;
          if ( bLetterBack ) {
            i++;
          }
          for ( ; i != partial_impovements.begin(); ) {
            i--;
            exclusion_exceptions += i->second;
          }
          if ( !inclusion_exceptions.empty() && !exclusion_exceptions.empty() ) {
            CTransformation * p = new CTransformation();
            p->bTemporary = true;
            p->from = from;
            p->to = to;
            p->bFromStart = bReverse;
            p->exceptions = exclusion_exceptions;
            transformations.push_back( p );
            exclusion_exceptions_error = check_bloom_iteration( false );
            cout << "    " << exclusion_exceptions << ": " << exclusion_exceptions_error << "\n";
            transformations.pop_back();
            delete p;
          }
          double min_error = min( base_error, no_exceptions_error );
          min_error = min( min_error, inclusion_exceptions_error );
          min_error = min( min_error, exclusion_exceptions_error );
          if ( min_error == base_error ) {
            cout << "  XXXX" << "\n";
          } else {
            string exceptions;
            if ( min_error != no_exceptions_error ) {
              if ( inclusion_exceptions_error == exclusion_exceptions_error ) {
                if ( inclusion_exceptions.length() > exclusion_exceptions.length() ) {
                  exceptions = exclusion_exceptions;
                } else {
                  exceptions = inclusion_exceptions;
                }
              } else {
                if ( min_error == inclusion_exceptions_error ) {
                  exceptions = inclusion_exceptions;
                } else
                if ( min_error == exclusion_exceptions_error ) {
                  exceptions = exclusion_exceptions;
                }
              }
            }
            std::sort( exceptions.begin(), exceptions.end() );
            cout << "  == \"" << exceptions << "\" (" << min_error << ")\n";
            ofstream os( bReverse ? "./recommendations_rev.txt" : "./recommendations.txt", ios::app );
            os << from << "," << to << "," << exceptions << " (" << min_error << ")\n";
            CTransformation * p = new CTransformation();
            p->from = from;
            p->to = to;
            p->bFromStart = bReverse;
            p->exceptions = exceptions;
            p->bNew = true;
            transformations.push_back( p );
            base_error = min_error;
          }
        }
      } else {
        getline( is, s );
      }
    }
  }
}

void iterate_bloom_full( bool bReverse, string from, string to ) {

  string filename( "./iterate_bloom_full_result.txt" );

  init_transformations();

  typedef multimap < double, char > t_partial_impovements;

  const char * alphabet = "abcdefghijklmnopqrstuvwxyz";
  int alphabet_length = strlen( alphabet );

  double base_error = check_bloom_iteration( false );
  {
    ofstream os( filename, ios::app );
    os << from << "," << to << "\n";
    os << "Base error: " << base_error << "\n";
  }

  double no_exceptions_error = 1;
  {
    CTransformation * p = new CTransformation();
    p->bTemporary = true;
    p->from = from;
    p->to = to;
    p->bFromStart = bReverse;
    transformations.push_back( p );
    no_exceptions_error = check_bloom_iteration( false );
    {
      ofstream os( filename, ios::app );
      os << "    " << no_exceptions_error << "\n";
    }
    transformations.pop_back();
    delete p;
  }
  double inclusion_exceptions_error = 1;
  string inclusion_exceptions;
  t_partial_impovements::iterator i;
  for ( int i = 0; i != alphabet_length; i++ ) {
    inclusion_exceptions += alphabet[ i ] - 32;
    CTransformation * p = new CTransformation();
    p->bTemporary = true;
    p->from = from;
    p->to = to;
    p->exceptions = inclusion_exceptions;
    p->bFromStart = bReverse;
    transformations.push_back( p );
    double current_error = check_bloom_iteration( false );
    {
      ofstream os( filename, ios::app );
      os << "    " << inclusion_exceptions << ": " << current_error << "\n";
    }
    transformations.pop_back();
    delete p;
    if ( current_error <= inclusion_exceptions_error ) {
      inclusion_exceptions_error = current_error;
    } else {
      inclusion_exceptions.pop_back();
    }
  }
  double exclusion_exceptions_error = 1;
  string exclusion_exceptions;
  for ( int i = 0; i != alphabet_length; i++ ) {
    exclusion_exceptions += alphabet[ i ];
    CTransformation * p = new CTransformation();
    p->bTemporary = true;
    p->from = from;
    p->to = to;
    p->bFromStart = bReverse;
    p->exceptions = exclusion_exceptions;
    transformations.push_back( p );
    double current_error = check_bloom_iteration( false );
    {
      ofstream os( filename, ios::app );
      os << "    " << exclusion_exceptions << ": " << current_error << "\n";
    }
    transformations.pop_back();
    delete p;
    if ( current_error <= exclusion_exceptions_error ) {
      exclusion_exceptions_error = current_error;
    } else {
      exclusion_exceptions.pop_back();
    }
  }
  double min_error = min( base_error, no_exceptions_error );
  min_error = min( min_error, inclusion_exceptions_error );
  min_error = min( min_error, exclusion_exceptions_error );
  if ( min_error == base_error ) {
    ofstream os( filename, ios::app );
    os << "  XXXX" << "\n";
  } else {
    string exceptions;
    if ( min_error != no_exceptions_error ) {
      if ( inclusion_exceptions_error == exclusion_exceptions_error ) {
        if ( inclusion_exceptions.length() > exclusion_exceptions.length() ) {
          exceptions = exclusion_exceptions;
        } else {
          exceptions = inclusion_exceptions;
        }
      } else {
        if ( min_error == inclusion_exceptions_error ) {
          exceptions = inclusion_exceptions;
        } else
        if ( min_error == exclusion_exceptions_error ) {
          exceptions = exclusion_exceptions;
        }
      }
    }
    std::sort( exceptions.begin(), exceptions.end() );
    ofstream os( filename, ios::app );
    os << "  == \"" << exceptions << "\" (" << min_error << ")\n";
    os << from << "," << to << "," << exceptions << " (" << min_error << ")\n";
    CTransformation * p = new CTransformation();
    p->from = from;
    p->to = to;
    p->bFromStart = bReverse;
    p->exceptions = exceptions;
    p->bNew = true;
    transformations.push_back( p );
    base_error = min_error;
  }
}

/*
===== 10000 =====
False positive: 0.146321 (74462)
False negative: 0.0551844 (28083)
Total error: 0.201506 (102545)

===== 12500 =====
False positive: 0.147528 (75076)
False negative: 0.0534944 (27223)
Total error: 0.201022 (102299)

===== 15000 =====
False positive: 0.148544 (75593)
False negative: 0.0521602 (26544)
Total error: 0.200704 (102137)

===== 17500 =====
False positive: 0.149782 (76223)
False negative: 0.0509831 (25945)
Total error: 0.200765 (102168)

===== 20000 =====
False positive: 0.150715 (76698)
False negative: 0.0500045 (25447)
Total error: 0.20072 (102145)

===== 30000 =====
False positive: 0.152902 (77811)
False negative: 0.0484109 (24636)
Total error: 0.201313 (102447)

===== 40000 =====
False positive: 0.154757 (78755)
False negative: 0.0470157 (23926)
Total error: 0.201773 (102681)

*/

long long int nonpairs_cutoff = 15000;

void nonpairs() {
  string_set * word_list = new string_set;
  while ( !cin.eof() ) {
    string s;
    cin >> s;
    if ( s.length() > 0 ) {
      strtolower( s );
      std::replace( s.begin(), s.end(), '\'', '{' );
      word_list->insert( s );
    }
  }

  typedef map < string, string_set > t_non_pairs;
  typedef multimap < long long int, string > t_non_pairs_sorted;

  /*{
    t_non_pairs non_pairs;
    t_non_pair_counts non_pair_counts;
    t_non_pairs_sorted non_pairs_sorted;
    for ( char i = 'a'; i <= '{'; i++ ) {
      for ( char k = 'a'; k <= '{'; k++ ) {
        string s;
        s += i;
        s += k;
        non_pairs[ s ];
        for ( string_set::iterator j = word_list.begin(); j != word_list.end(); j++ ) {
          if ( j->find( s ) != -1 ) {
            if ( non_pairs[ s ].size() < 2000 ) {
              non_pairs[ s ].insert( *j );
            }
            non_pair_counts[ s ]++;
          }
        }
        non_pairs_sorted.insert( t_non_pairs_sorted::value_type( non_pair_counts[ s ], s ) );
      }
    }
    return;
  }*/

  t_weighted_strings * non_pair_counts = new t_weighted_strings;
  for ( char i = 'a'; i <= '{'; i++ ) {
    for ( char k = 'a'; k <= '{'; k++ ) {
      string s;
      s += i;
      s += k;
      //if ( word_list.find( s ) == word_list.end() ) {
        ( *non_pair_counts )[ s ];
        ( *non_pair_counts )[ s + "$" ];
        ( *non_pair_counts )[ s + "-" ];
        for ( string_set::iterator k = word_list->begin(); k != word_list->end(); k++ ) {
          if ( k->find( s ) != -1 ) {
            ( *non_pair_counts )[ s + "-" ]++;
            if ( k->length() > 2 && k->substr( k->length() - 2 )[ 0 ] == s[ 0 ] && k->substr( k->length() - 2 )[ 1 ] == s[ 1 ] ) {
              ( *non_pair_counts )[ s + "$" ]++;
            } else if ( k->substr( 0, 2 ) == s ) {
              ( *non_pair_counts )[ s ]++;
            }
          }
        }
      //}
    }
  }

  string nonpairs_map;
  t_non_pairs_sorted * non_pairs_sorted = new t_non_pairs_sorted;
  int counter = 0;
  double cutoff = word_list->size() / nonpairs_cutoff;
  unsigned char * nonpairs_buffer = new unsigned char[ nonpairs_buffer_size ]();
  {
    ofstream os( "./nonpairs_bits.txt" );
    for ( unsigned char i = 'a'; i <= '{'; i++ ) {
      for ( unsigned char k = 'a'; k <= '{'; k++ ) {
        string s;
        s += i;
        s += k;
        t_weighted_strings::iterator p( non_pair_counts->find( s ) );
        t_weighted_strings::iterator p_rev( non_pair_counts->find( s + "$" ) );
        t_weighted_strings::iterator p_total( non_pair_counts->find( s + "-" ) );
        if ( p == non_pair_counts->end() ) {
          os << 0;
          os << 0;
          os << 0;
        } else {
          nonpairs_map += k;
          non_pairs_sorted->insert( t_non_pairs_sorted::value_type( p->second, s ) );
          non_pairs_sorted->insert( t_non_pairs_sorted::value_type( p_rev->second, s + "$" ) );
          non_pairs_sorted->insert( t_non_pairs_sorted::value_type( p_total->second, s + "-" ) );
          int bit_pos = int( i - 'a' ) * 27 + int( k - 'a' );
          if ( double( p_total->second ) < cutoff ) {
            // total nonpair
            nonpairs_buffer[ bit_pos / 8 ] |= ( 1 << ( bit_pos % 8 ) );
            os << 1;
            os << 0;
            os << 0;
          } else {
            // start or/and end nonpair
            os << 0;
            bit_pos += 27 * 27;
            if ( double( p->second ) < cutoff ) {
              nonpairs_buffer[ bit_pos / 8 ] |= ( 1 << ( bit_pos % 8 ) );
              os << 1;
            } else {
              os << 0;
            }
            bit_pos += 27 * 27;
            if ( double( p_rev->second ) < cutoff ) {
              nonpairs_buffer[ bit_pos / 8 ] |= ( 1 << ( bit_pos % 8 ) );
              os << 1;
            } else {
              os << 0;
            }
          }
        }
        counter++;
      }
      nonpairs_map += ",";
    }
  }

  {
    ofstream os( "./nonpairs.txt", ios::binary );
    os.write( ( char * )&( nonpairs_buffer[ 0 ] ), nonpairs_buffer_size );
  }

  word_list->size();
}


void stat() {
  string_set word_list;
  while ( !cin.eof() ) {
    string s;
    cin >> s;
    if ( s.length() > 0 ) {
      strtolower( s ); //  + "'s"
      word_list.insert( s );
    }
  }

  string_set exclusions;
  if (0) for ( string_set::iterator i = word_list.begin(); i != word_list.end(); i++ ) {
    int pos = i->find_last_of( "'" );
    if ( pos >= 0 && pos != 1 && pos != 2 && pos != i->length() - 2 && pos != i->length() - 3 ) {
      exclusions.insert( *i );
    }
    /*
    if ( pos >= 0 ) {
      string s = i->substr( pos );
      if ( s.length() > 2 && s != "'ed" && s != "'er" && s != "'re" && s != "'ll" && s != "'ve" ) {
        string s = i->substr( 0, pos + 1 );
        if ( s.length() > 2 ) {
          exclusions.insert( *i );
        }
      }
    }
    */
  }

  map < int, string_set > lengths;
  map < int, string_set > consonant_lengths;
  map < int, string_set > vowel_lengths;
  string_set consonant_ligatures = { "th", "sh", "ch", "ph", "ck", "gh", "ng", "sch", "mc", "hl", "st", "dt", "cz", "ght" };
  string_set vowel_ligatures = { "ae", "ya", "ye", "yo", "ao", "au", "io", "ia", "eu", "yu", "ou", "yie", "yi", "ue" };
  char * consonants = "Bqwrtpsdfghjklzxvbnm";
  char * vowels = "Aeyuioa";
  for ( string_set::iterator i = word_list.begin(); i != word_list.end(); i++ ) {
    lengths[ i->length() ].insert( *i );
    int consonant_count = 0;
    int max_consonant_count = 0;
    int vowel_count = 0;
    int max_vowel_count = 0;
    string s( *i );
    for ( string_set::iterator k = consonant_ligatures.end(); k != consonant_ligatures.begin(); ) {
      k--;
      str_replace( s, *k, "B" );
    }
    for ( string_set::iterator k = vowel_ligatures.end(); k != vowel_ligatures.begin(); ) {
      k--;
      str_replace( s, *k, "A" );
    }
    char prev_char = '\0';
    for ( string::const_iterator k = s.begin(); k != s.end(); k++ ) {
      if ( strchr( vowels, *k ) == NULL ) {
        if ( *k != '\'' ) {
          if ( *k != prev_char ) {
            consonant_count++;
          }
          if ( vowel_count > max_vowel_count ) {
            max_vowel_count = vowel_count;
          }
          vowel_count = 0;
        }
      } else {
        if ( *k != prev_char ) {
          vowel_count++;
        }
        if ( consonant_count > max_consonant_count ) {
          max_consonant_count = consonant_count;
        }
        consonant_count = 0;
      }
      prev_char = *k;
    }
    if ( vowel_count > max_vowel_count ) {
      max_vowel_count = vowel_count;
    }
    if ( consonant_count > max_consonant_count ) {
      max_consonant_count = consonant_count;
    }
    consonant_lengths[ max_consonant_count ].insert( *i );
    vowel_lengths[ max_vowel_count ].insert( *i );
  }
  /*
  string_set non_pairs;
  for ( char i = 'a'; i <= 'z'; i++ ) {
    for ( char k = 'a'; k <= 'z'; k++ ) {
      string s;
      s += i;
      s += k;
      if ( word_list.find( s ) == word_list.end() ) {
        non_pairs.insert( s );
      }
    }
  }*/

  word_list.size();

}

typedef set < unsigned int > istring_set;
typedef map < unsigned int, istring_set > t_string_stems;

typedef map < unsigned int, unsigned int > t_i_mutual_cor_item;
typedef map < unsigned int, t_i_mutual_cor_item > t_i_mutual_cor;
typedef multimap < double, pair < const char *, istring_set > > t_popular_parts;
typedef vector < string > string_vector;
typedef map < string, unsigned int > string_vector_pointer;

typedef map < string, unsigned int > t_mutual_cor_item;
typedef map < string, t_mutual_cor_item > t_mutual_cor;

void sample_stem( bool bReverse ) {
  string_set word_list;
  string_set dictionary_word_list;
  string_vector parts;
  string_vector_pointer parts_pointer;
  t_string_stems string_parts;
  t_string_stems string_parts_backref;
  t_string_stems string_parts_dictionary_backref;
  {
    unsigned long long int counter = 0;
    ifstream is( DICTIONARY_FILENAME );
    while ( !is.eof() ) {
      string s;
      is >> s;
      strtolower( s );
      if ( bReverse ) {
        reverse( s.begin(), s.end() );
      }
      dictionary_word_list.insert( s );
      counter++;
      //if ( counter > 20000 ) {      break;    }
    }
  }

  {
    unsigned long long int counter = 0;
    ifstream is( "./filtered_sample.txt" );
    while ( !is.eof() ) {
      string s;
      is >> s;
      strtolower( s );
      if ( bReverse ) {
        reverse( s.begin(), s.end() );
      }
      word_list.insert( s );
      counter++;
      //if ( counter > 20000 ) {      break;    }
    }
  }

  /*
  {
    ifstream is( "./test_data_original_.json" );
    //ifstream is( "./test_data_.json" );
    while ( !is.eof() && is.good() ) {
      string s;
      getline( is, s );
      if ( s.length() > 0 && s != "{" && s != "}" ) {
        strtolower( s );
        string_array arr;
        explode( ": ", s, arr );
        arr[ 0 ].erase( 0, arr[ 0 ].find_first_not_of(" \"") );
        arr[ 0 ].erase( arr[ 0 ].find_last_not_of(" \"") + 1 );
        if ( bReverse ) {
          reverse( arr[ 0 ].begin(), arr[ 0 ].end() );
        }
        word_list.insert( arr[ 0 ] );
      }
    }
  }
  */

  unsigned long long int counter = 0;
  unsigned long long int total_count = 0;
  unsigned long long int single_count = 0;

  // alphabetic parts sorting
  {
    unsigned long long int counter = 0;
    for ( string_set::iterator s = word_list.begin(); s != word_list.end(); s++ ) {
      int i = s->length();
      while ( i > 0 ) {
        parts_pointer[ s->substr( 0, i ) ] = 0;
        parts_pointer[ s->substr( i ) ] = 0;
        i--;
      }
      counter++;
      if ( counter % 10000 == 0 ) {
        string s_( *s );
        if ( bReverse ) {
          reverse( s_.begin(), s_.end() );
        }
        cout << s_ << " (" << counter << ")" << "\n";
      }
    }
  }
  {
    unsigned long long int counter = 0;
    for ( string_vector_pointer::iterator i = parts_pointer.begin(); i != parts_pointer.end(); i++ ) {
      parts.push_back( i->first );
      parts_pointer[ i->first ] = parts.size() - 1;
    }
  }

  for ( string_set::iterator s = word_list.begin(); s != word_list.end(); s++ ) {
    int i = s->length();
    bool bDictionaryWord = ( dictionary_word_list.find( *s ) != dictionary_word_list.end() );
    while ( i > 0 ) {
      unsigned int start = parts_pointer[ s->substr( 0, i ) ];
      unsigned int end = parts_pointer[ s->substr( i ) ];
      string_parts[ start ].insert( end );
      string_parts_backref[ end ].insert( start );
      if ( bDictionaryWord ) {
        string_parts_dictionary_backref[ end ].insert( start );
      }
      i--;
    }
    counter++;
    if ( counter % 10000 == 0 ) {
      string s_( *s );
      if ( bReverse ) {
        reverse( s_.begin(), s_.end() );
      }
      cout << s_ << " (" << counter << ")" << "\n";
    }
    //if ( counter > 20000 ) {      break;    }
  }

  t_string_stems stems_by_popular_suffixes;
  unsigned int cutoff = 1;
  for ( t_string_stems::iterator suffix = string_parts_backref.begin(); suffix != string_parts_backref.end(); suffix++ ) {
    if ( suffix->second.size() > cutoff ) {
      stems_by_popular_suffixes.insert( *suffix );
    }
  }

  {
    ofstream os( string( "./correlations" ) + ( bReverse ? "_rev" : "" ) + "_sample.txt" );
    {
      unsigned long long int counter = 0;
      for ( t_string_stems::iterator suffix = stems_by_popular_suffixes.begin(); suffix != stems_by_popular_suffixes.end(); suffix++ ) {
        os << parts[ suffix->first ] << "[" << string_parts_backref[ suffix->first ].size() << "," << string_parts_dictionary_backref[ suffix->first ].size() << "];";
        counter++;
        if ( counter % 1000 == 0 ) {
          string s_( parts[ suffix->first ] );
          if ( bReverse ) {
            reverse( s_.begin(), s_.end() );
          }
          cout << s_ << " (" << counter << ")" << "\n";
        }
      }
    }
  }

  ::TerminateProcess( ::GetCurrentProcess(), 0 );
}

typedef queue < string ** > t_string_queue;

class dictionary_stem_data {
public:
  mutex access;
  string_vector parts;
  t_string_stems string_parts;
  t_string_stems string_parts_backref;
  unsigned long long int counter = 0;
  t_string_queue results;
  bool bReverse = false;
};

void dictionary_stem_worker( int id, dictionary_stem_data * d, t_string_stems::iterator suffix, string ** result ) {
  unsigned int * corr_buffer = new unsigned int[ d->parts.size() ]();
  for ( istring_set::iterator suffixed_stem_name = suffix->second.begin(); suffixed_stem_name != suffix->second.end(); suffixed_stem_name++ ) {
    t_string_stems::iterator stem( d->string_parts.find( *suffixed_stem_name ) );
    if ( stem != d->string_parts.end() ) {
      for ( istring_set::iterator correlated_suffix_name = stem->second.begin(); correlated_suffix_name != stem->second.end(); correlated_suffix_name++ ) {
        if ( suffix->first != *correlated_suffix_name ) {
          lock_guard < mutex > ( d->access );
          corr_buffer[ *correlated_suffix_name ]++;
        }
      }
    }
    d->counter++;
    if ( d->counter % 1000 == 0 ) {
      lock_guard < mutex > ( d->access );
      string s_( d->parts[ suffix->first ] );
      if ( d->bReverse ) {
        reverse( s_.begin(), s_.end() );
      }
      cout << s_ << " (" << d->counter << ")" << "\n";
    }
  }
  bool bFirst = true;
  stringstream os;
  for ( unsigned int i = 0; i != d->parts.size(); i++ ) {
    if ( corr_buffer[ i ] > 1 ) {
      if ( bFirst ) {
        bFirst = false;
        os << d->parts[ suffix->first ] << "[" << d->string_parts_backref[ suffix->first ].size() << "]{";
      }
      os << d->parts[ i ] << "[" << d->string_parts_backref[ i ].size() << "]," << corr_buffer[ i ] << ";";
      //i_mutual_cor[ suffix->first ][ i ] = corr_buffer[ i ];
    }
  }
  if ( !bFirst ) {
    os << "};";
  }
  {
    lock_guard < mutex >( d->access );
    *result = new string( os.str() );
  }
  delete[] corr_buffer;
}

void dictionary_stem( bool bReverse ) {

  ctpl::thread_pool threads( thread::hardware_concurrency() );

  dictionary_stem_data d;
  d.bReverse = bReverse;
  typedef set < string > t_parts_sorted_by_length;
  string_set word_list;
  string_vector_pointer parts_pointer;
  t_string_stems string_parts_meaningful;
  t_parts_sorted_by_length parts_sorted_by_length;
  //t_mutual_cor mutual_cor;
  {
    unsigned long long int counter = 0;
    ifstream is( "./bloom_words_after_transformations.txt" );
    while ( !is.eof() ) {
      string s;
      is >> s;
      strtolower( s );
      if ( bReverse ) {
        reverse( s.begin(), s.end() );
      }
      word_list.insert( s );
      counter++;
      //if ( counter > 20000 ) {      break;    }
    }
  }
  unsigned long long int counter = 0;
  unsigned long long int total_count = 0;
  unsigned long long int single_count = 0;

  // sorting parts by length
  {
    unsigned long long int counter = 0;
    for ( string_set::iterator s = word_list.begin(); s != word_list.end(); s++ ) {
      int i = s->length();
      while ( i > 0 ) {
        string prefix( s->substr( 0, i ) );
        string suffix( s->substr( i ) );
        if ( parts_pointer.find( prefix ) == parts_pointer.end() ) {
          parts_pointer[ prefix ] = 0;
          parts_sorted_by_length.insert( char( prefix.length() ) + prefix );
        }
        if ( parts_pointer.find( suffix ) == parts_pointer.end() ) {
          parts_pointer[ suffix ] = 0;
          parts_sorted_by_length.insert( char( suffix.length() ) + suffix );
        }
        i--;
      }
      counter++;
      if ( counter % 10000 == 0 ) {
        string s_( *s );
        if ( bReverse ) {
          reverse( s_.begin(), s_.end() );
        }
        cout << s_ << " (" << counter << ")" << "\n";
      }
    }
  }
  {
    unsigned long long int counter = 0;
    for ( t_parts_sorted_by_length::iterator i = parts_sorted_by_length.begin(); i != parts_sorted_by_length.end(); i++ ) {
      d.parts.push_back( i->substr( 1 ) );
      parts_pointer[ i->substr( 1 ) ] = d.parts.size() - 1;
    }
  }

  for ( string_set::iterator s = word_list.begin(); s != word_list.end(); s++ ) {
    int i = s->length();
    while ( i > 0 ) {
      unsigned int start = parts_pointer[ s->substr( 0, i ) ];
      unsigned int end = parts_pointer[ s->substr( i ) ];
      /*
      t_string_stems::iterator stem( string_parts.find( start ) );
      if ( stem != string_parts.end() ) {
        for ( string_set::iterator i = stem->second.begin(); i != stem->second.end(); i++ ) {
          unsigned int & val( mutual_cor[ *i ][ end ] );
          val++;
          if ( val == 1 ) {
            single_count++;
            total_count++;
          } else {
            single_count--;
          }
          counter++;
          if ( counter % 100000 == 0 ) {
            cout << *s << "(" << counter << ") [" << double( single_count ) / double( total_count ) << "]\n";
          }
        }
      }*/
      d.string_parts[ start ].insert( end );
      d.string_parts_backref[ end ].insert( start );
      i--;
    }
    counter++;
    if ( counter % 10000 == 0 ) {
      string s_( *s );
      if ( bReverse ) {
        reverse( s_.begin(), s_.end() );
      }
      cout << s_ << " (" << counter << ")" << "\n";
    }
    //if ( counter > 20000 ) {      break;    }
  }

  t_string_stems stems_by_popular_suffixes;
  unsigned int cutoff = 1;
  for ( t_string_stems::iterator suffix = d.string_parts_backref.begin(); suffix != d.string_parts_backref.end(); suffix++ ) {
    if ( suffix->second.size() > cutoff ) {
      stems_by_popular_suffixes.insert( *suffix );
    }
  }
  /*
  t_string_stems popular_suffixes_by_stems;
  for ( t_string_stems::iterator stem = string_parts.begin(); stem != string_parts.end(); stem++ ) {
    for ( string_set::iterator suffix = stem->second.begin(); suffix != stem->second.end(); suffix++ ) {
      if ( stems_by_popular_suffixes.find( *suffix ) != stems_by_popular_suffixes.end() ) {
        popular_suffixes_by_stems[ stem->first ].insert( *suffix );
      }
    }
  }
  */
  /*
  t_string_stems popular_suffixes_by_stems;
  for ( t_string_stems::iterator stem = popular_suffixes_by_stems.begin(); stem != popular_suffixes_by_stems.end(); stem++ ) {
    if ( stem->second.size() > 1 ) {
      popular_suffixes_by_stems.insert( *stem );
    }
  }
  */

  /*t_popular_parts popular_parts;
  for ( t_string_stems::iterator stem = string_parts_backref.begin(); stem != string_parts_backref.end(); stem++ ) {
    unsigned int size = stem->second.size();
    if ( size > 1 ) {
      popular_parts.insert( t_popular_parts::value_type( 1 - double( size ) / double( counter ), *stem ) );
    }
  }*/

  //for ( t_popular_parts::iterator part = popular_parts.begin(); part != popular_parts.end(); part++ ) {
  //}

  {
    ofstream os( string( "./correlations" ) + ( bReverse ? "_rev" : "" ) + ".txt" );
    t_i_mutual_cor i_mutual_cor;
    {
      d.counter = 0;
      for ( t_string_stems::iterator suffix = stems_by_popular_suffixes.begin(); suffix != stems_by_popular_suffixes.end(); suffix++ ) {
        threads.wait_idle( -WORK_QUEUE_DEPTH );
        string ** ps = new string*();
        d.results.push( ps );
        threads.push( dictionary_stem_worker, &d, suffix, d.results.back() );
        lock_guard < mutex > ( d.access );
        while ( !d.results.empty() && *d.results.front() != NULL ) {
          os << **d.results.front();
          delete *d.results.front();
          delete d.results.front();
          d.results.pop();
        }
      }
      threads.stop( true );
      lock_guard < mutex > ( d.access );
      while ( !d.results.empty() ) {
        os << **d.results.front();
        delete *d.results.front();
        delete d.results.front();
        d.results.pop();
      }
    }

    /*
    t_mutual_cor mutual_cor;
    for ( t_i_mutual_cor::iterator i = i_mutual_cor.begin(); i != i_mutual_cor.end(); i++ ) {
      for ( t_i_mutual_cor_item::iterator k = i->second.begin(); k != i->second.end(); k++ ) {
        mutual_cor[ parts[ i->first ] ][ parts[ k->first ] ] = k->second;
      }
    }
    */
  }

  ::TerminateProcess( ::GetCurrentProcess(), 0 );
}

class unstem_data {
public:
  mutex access;
  CDeltaErrorData data;
  t_mutual_cor_item sample_count;
  t_mutual_cor_item sample_dict_count;
  double cutoff = 0.00001;
  double k_sample = N_sample * P_sample_dict_bloom / N_dict;
  string parent_search_base;
  t_correlation_stats_by_name chosen_stems;
  unsigned long long int counter = 0;
  t_correlation_stats correlation_stats;
  t_correlation_stats_by_name correlation_stats_by_name;
  string_set chosen_stems_set;
  bool bReverse = false;
};

void unstem_worker( int id, unstem_data * d, string x, string y, string xy_correlation, string y_count ) {
  unsigned int i_y = 0;
  /*
  string_vector_pointer::iterator part_pointer( parts_pointer.find( y ) );
  if ( part_pointer == parts_pointer.end() ) {
    parts.push_back( y );
    i_y = parts.size() - 1;
    parts_pointer[ y ] = i_y;
  }
  */
  /*
  if ( string( *x ) == "ief" && string( *y ) == "id" ) {
    id++;
  }
  */

  CDeltaErrorData data( d->data );
  data.Nxy_dict = atoll( xy_correlation.c_str() );
  data.Ny_dict = atoll( y_count.c_str() );
  data.Ny_sample_dict = max( d->sample_dict_count[ y ], d->k_sample * data.Ny_dict );
  data.Ny_sample = max( d->sample_count[ y ], data.Ny_sample_dict );
  /*
  CCorrelationData * p_x_sample = sample_correlation_data[ direction ? k->first : i->first ];
  if ( p_x_sample ) {
    data.Nx_sample = p_x_sample->sum;
    data.Nx_sample_dict = p_x_sample->dictionary_sum;
  }
  CCorrelationData * p_y_sample = sample_correlation_data[ direction ? i->first : k->first  ];
  if ( p_y_sample ) {
    data.Ny_sample = p_y_sample->sum;
    data.Ny_sample_dict = p_y_sample->dictionary_sum;
  }
  */

  double delta_error = calculate_delta_error( data );
  bool bSignificant = ( delta_error >= d->cutoff );
  bool bPartOfSignificant = false;
  t_correlation_stats_by_name::iterator significant_parent;
  if ( !d->parent_search_base.empty() ) {
    if ( ( x )[ 0 ] == ( y )[ 0 ] && ( x )[ 0 ] != '\0' ) {
      //lock_guard < mutex >( d->access );
      significant_parent = d->chosen_stems.find( d->parent_search_base + y.substr( 1 ) );
      if ( significant_parent != d->chosen_stems.end() ) {
        bPartOfSignificant = true;
      }
    }
  }
  if ( 
    bSignificant
    ||
    bPartOfSignificant
  ) {
    CCorrelationStats * p = new CCorrelationStats();
    p->from = x;
    p->to = y;
    string from( p->from );
    string to( p->to );
    if ( d->bReverse ) {
      reverse( from.begin(), from.end() );
      reverse( to.begin(), to.end() );
    }
    p->s = from + " => " + to;
    p->delta = delta_error;
    lock_guard < mutex > ( d->access );
    if ( bPartOfSignificant ) {
      d->correlation_stats_by_name[ x + ( " + " + significant_parent->second->s ) ] = p;
    } else {
      d->chosen_stems[ string( x ) + " => " + y ] = p;
      d->chosen_stems_set.insert( x );
      d->correlation_stats.insert( t_correlation_stats::value_type( delta_error, p ) );
    }
  }
  d->counter++;
  if ( d->counter % 100000 == 0 ) {
    string s_( x );
    if ( d->bReverse ) {
      reverse( s_.begin(), s_.end() );
    }
    cout << s_ << " (" << d->counter << ")" << "\n";
  }
}

void unstem( bool bReverse ) {

  /*{
    // 0.033
    CTransformation * p = new CTransformation();
    p->bPreferFalsePositives = false;
    p->from = "'s";
    p->to = "";
    transformations.push_back( p );
  }
  {
    // 0.0009
    CTransformation * p = new CTransformation();
    p->bPreferFalsePositives = false;
    p->from = "s";
    p->to = "";
    p->exceptions = "isu";
    transformations.push_back( p );
  }*/

  init_transformations();

  t_mutual_cor_item sample_count;
  t_mutual_cor_item sample_dict_count;
  {
    ifstream is( string( "./correlations" ) + ( bReverse ? "_rev" : "" ) + "_sample.txt" );
    {
      char * x = new char [ 100 ];
      char * x_count = new char [ 20 ];
      char * x_dict_count = new char [ 20 ];
      unsigned long long int counter = 0;
      char * p = NULL;
      while ( !is.eof() && is.good() ) {
        char c = '\0';
        is >> c;
        p = x;
        while ( !is.eof() && c != '[' ) {
          *p++ = c;
          is >> c;
        }
        *p = '\0';
        if ( *x == 0 ) {
          p++;
        }
        is >> c;
        p = x_count;
        while ( !is.eof() && c != ',' ) {
          *p++ = c;
          is >> c;
        }
        *p = '\0';
        if ( is.eof() ) { break; }
        sample_count[ x ] = atoll( x_count );
        is >> c; // {
        p = x_dict_count;
        while ( !is.eof() && c != ']' ) {
          *p++ = c;
          is >> c;
        }
        *p = '\0';
        if ( is.eof() ) { break; }
        sample_dict_count[ x ] = atoll( x_dict_count );
        is >> c; // ]
      }
    }
  }

  string_vector parts;
  string_vector_pointer parts_pointer;
  t_correlation_stats correlation_stats;
  t_correlation_stats_by_name correlation_stats_by_name;
  t_correlation_stats_by_name chosen_stems;
  string_set chosen_stems_set;
  double cutoff = 0.00001;
  double k_sample = N_sample * P_sample_dict_bloom / N_dict;
  {
    ifstream is( string( "./correlations" ) + ( bReverse ? "_rev" : "" ) + ".txt" );
    t_i_mutual_cor i_mutual_cor;
    {
      char * x = new char [ 100 ];
      char * x_count = new char [ 20 ];
      char * y = new char [ 100 ];
      char * y_count = new char [ 20 ];
      char * xy_correlation = new char [ 20 ];
      unsigned long long int counter = 0;
      char * p = NULL;
      while ( !is.eof() && is.good() ) {
        char c = '\0';
        is >> c;
        p = x;
        while ( !is.eof() && c != '[' ) {
          *p++ = c;
          is >> c;
        }
        *p = '\0';
        is >> c;
        p = x_count;
        while ( !is.eof() && c != ']' ) {
          *p++ = c;
          is >> c;
        }
        *p = '\0';
        is >> c; // {
        bool bFirstPair = true;
        unsigned int i_x = 0;
        CDeltaErrorData data;
        data.Nx_dict = atoll( x_count );
        data.suffix_length = strlen( x );
        data.Nx_sample_dict = max( sample_dict_count[ x ], k_sample * data.Nx_dict );
        data.Nx_sample = max( sample_count[ x ], data.Nx_sample_dict );
        string parent_search_base;
        if ( chosen_stems_set.find( x + 1 ) != chosen_stems_set.end() ) {
          parent_search_base = ( string( x + 1 ) + " => " );
        }
        bool bSkip = false;
        if ( c == '{' ) {
          is >> c; 
          while ( !is.eof() && c != '}' ) {
            p = y;
            while ( !is.eof() && c != '[' ) {
              *p++ = c;
              is >> c;
            }
            *p = '\0';
            is >> c; // [
            p = y_count;
            while ( !is.eof() && c != ']' ) {
              *p++ = c;
              is >> c;
            }
            *p = '\0';
            is >> c; // ,
            is >> c;
            p = xy_correlation;
            while ( !is.eof() && c != ';' ) {
              *p++ = c;
              is >> c;
            }
            *p = '\0';

            if ( !bSkip && *x != '\0' ) {

              if ( bFirstPair ) {
                bFirstPair = false;
                size_t x_length = strlen( x );
              
                /*
                if ( strcmp( x, "s" ) == 0 ) {
                  p++;
                }
                */

                for ( t_transformations::iterator transformation = transformations.begin(); !bSkip && transformation != transformations.end(); transformation++ ) {
                  string * compare_with = NULL;
                  if ( ( *transformation )->bFromStart && bReverse ) {
                    if ( ( *transformation )->from_rev.length() == 0 && ( *transformation )->from.length() != 0 ) {
                      ( *transformation )->from_rev = ( *transformation )->from;
                      reverse( ( *transformation )->from_rev.begin(), ( *transformation )->from_rev.end() );
                    }
                    compare_with = &( *transformation )->from_rev;
                  } else if ( !( *transformation )->bFromStart && !bReverse ) {
                    compare_with = &( *transformation )->from;
                  }
                  if ( 
                    compare_with != NULL
                    &&
                    x_length >= compare_with->length()
                    &&
                    strcmp( x + x_length - compare_with->length(), compare_with->c_str() ) == 0
                    &&
                    (
                      ( *transformation )->exceptions.empty()
                      ||
                      x_length <= compare_with->length()
                      ||
                      (
                        ( *transformation )->exceptions.c_str()[ 0 ] >= 'a'
                        &&
                        strchr( ( *transformation )->exceptions.c_str(), x[ x_length - compare_with->length() - 1 ] ) == NULL
                      )
                      ||
                      (
                        ( *transformation )->exceptions.c_str()[ 0 ] < 'a'
                        &&
                        strchr( ( *transformation )->exceptions.c_str(), x[ x_length - compare_with->length() - 1 ] - 32 ) != NULL
                      )
                    )
                  ) {
                    bSkip = true;
                  }
                }
              }

              if ( !bSkip ) {
                unsigned int i_y = 0;
                /*
                string_vector_pointer::iterator part_pointer( parts_pointer.find( y ) );
                if ( part_pointer == parts_pointer.end() ) {
                  parts.push_back( y );
                  i_y = parts.size() - 1;
                  parts_pointer[ y ] = i_y;
                }
                */
                /*
                if ( string( x ) == "a's" && string( y ) == "abasco" ) {
                  p++;
                }
                */

                data.Nxy_dict = atoll( xy_correlation );
                data.Ny_dict = atoll( y_count );
                data.Ny_sample_dict = max( sample_dict_count[ y ], k_sample * data.Ny_dict );
                data.Ny_sample = max( sample_count[ y ], data.Ny_sample_dict );
                /*
                CCorrelationData * p_x_sample = sample_correlation_data[ direction ? k->first : i->first ];
                if ( p_x_sample ) {
                  data.Nx_sample = p_x_sample->sum;
                  data.Nx_sample_dict = p_x_sample->dictionary_sum;
                }
                CCorrelationData * p_y_sample = sample_correlation_data[ direction ? i->first : k->first  ];
                if ( p_y_sample ) {
                  data.Ny_sample = p_y_sample->sum;
                  data.Ny_sample_dict = p_y_sample->dictionary_sum;
                }
                */

                double delta_error = calculate_delta_error( data );
                bool bSignificant = ( delta_error >= cutoff );
                bool bPartOfSignificant = false;
                t_correlation_stats_by_name::iterator significant_parent;
                if ( !parent_search_base.empty() ) {
                  if ( *x == *y && *x != '\0' ) {
                    significant_parent = chosen_stems.find( parent_search_base + ( y + 1 ) );
                    if ( significant_parent != chosen_stems.end() ) {
                      bPartOfSignificant = true;
                    }
                  }
                }
                if ( 
                  bSignificant
                  ||
                  bPartOfSignificant
                ) {
                  CCorrelationStats * p = new CCorrelationStats();
                  p->from = x;
                  p->to = y;
                  string from( p->from );
                  string to( p->to );
                  if ( bReverse ) {
                    reverse( from.begin(), from.end() );
                    reverse( to.begin(), to.end() );
                  }
                  p->s = from + " => " + to;
                  p->delta = delta_error;
                  if ( bPartOfSignificant ) {
                    correlation_stats_by_name[ *x + ( " + " + significant_parent->second->s ) ] = p;
                  } else {
                    chosen_stems[ string( x ) + " => " + y ] = p;
                    chosen_stems_set.insert( x );
                    correlation_stats.insert( t_correlation_stats::value_type( delta_error, p ) );
                  }
                }
                counter++;
                if ( counter % 100000 == 0 ) {
                  string s_( x );
                  if ( bReverse ) {
                    reverse( s_.begin(), s_.end() );
                  }
                  cout << s_ << " (" << counter << ")" << "\n";
                }
              }
            }

            is >> c;
          }
        }
        is >> c; // }
        //if ( counter > 10000000 ) { break; }
      }
    }
  }

  {
    ofstream os ( string( "./correlation_results" ) + ( bReverse ? "_rev" : "" ) + ".txt" );
    int counter = 0;
    for ( t_correlation_stats::iterator i = correlation_stats.end(); i != correlation_stats.begin() && counter < 20000; counter++ ) {
      i--;
      os << i->second->s << " (" << i->first << ")\n";
      t_correlation_stats child_correlation_stats;
      for ( int k = 0; k < alphabet_length; k++ ) {
        char letter = alphabet[ k ];
        t_correlation_stats_by_name::iterator child( correlation_stats_by_name.find( letter + ( " + " + i->second->s ) ) );
        if ( child != correlation_stats_by_name.end() ) {
          child_correlation_stats.insert( t_correlation_stats::value_type( child->second->delta, child->second ) );
        }
      }
      for ( t_correlation_stats::iterator k = child_correlation_stats.end(); k != child_correlation_stats.begin(); ) {
        k--;
        os << "  " << k->second->s << " (" << k->second->delta << ")\n";
      }
    }
  }

  ::TerminateProcess( ::GetCurrentProcess(), 0 );
}

void _unstem( bool bReverse ) {

  init_transformations();

  ctpl::thread_pool threads( 
    //1);
    thread::hardware_concurrency() );

  unstem_data d;
  d.bReverse = bReverse;

  {
    ifstream is( string( "./correlations" ) + ( bReverse ? "_rev" : "" ) + "_sample.txt" );
    {
      char * x = new char [ 100 ];
      char * x_count = new char [ 20 ];
      char * x_dict_count = new char [ 20 ];
      unsigned long long int counter = 0;
      char * p = NULL;
      while ( !is.eof() && is.good() ) {
        char c = '\0';
        is >> c;
        p = x;
        while ( !is.eof() && c != '[' ) {
          *p++ = c;
          is >> c;
        }
        *p = '\0';
        if ( *x == 0 ) {
          p++;
        }
        is >> c;
        p = x_count;
        while ( !is.eof() && c != ',' ) {
          *p++ = c;
          is >> c;
        }
        *p = '\0';
        if ( is.eof() ) { break; }
        d.sample_count[ x ] = atoll( x_count );
        is >> c; // {
        p = x_dict_count;
        while ( !is.eof() && c != ']' ) {
          *p++ = c;
          is >> c;
        }
        *p = '\0';
        if ( is.eof() ) { break; }
        d.sample_dict_count[ x ] = atoll( x_dict_count );
        is >> c; // ]
      }
    }
  }

  string_vector parts;
  string_vector_pointer parts_pointer;
  {
    ifstream is( string( "./correlations" ) + ( bReverse ? "_rev" : "" ) + ".txt" );
    t_i_mutual_cor i_mutual_cor;
    {
      char * x = new char [ 100 ];
      char * x_count = new char [ 20 ];
      char * y = new char [ 100 ];
      char * y_count = new char [ 20 ];
      char * xy_correlation = new char [ 20 ];
      char * p = NULL;
      size_t prev_x_length = 0;
      while ( !is.eof() && is.good() ) {
        char c = '\0';
        is >> c;
        p = x;
        while ( !is.eof() && c != '[' ) {
          *p++ = c;
          is >> c;
        }
        *p = '\0';
        is >> c;
        p = x_count;
        while ( !is.eof() && c != ']' ) {
          *p++ = c;
          is >> c;
        }
        *p = '\0';
        is >> c; // {
        bool bFirstPair = true;
        unsigned int i_x = 0;
        threads.wait_idle(); // new x
        d.data.Nx_dict = atoll( x_count );
        d.data.suffix_length = strlen( x );
        d.data.Nx_sample_dict = max( d.sample_dict_count[ x ], d.k_sample * d.data.Nx_dict );
        d.data.Nx_sample = max( d.sample_count[ x ], d.data.Nx_sample_dict );
        d.parent_search_base.clear();
        if ( d.chosen_stems_set.find( x + 1 ) != d.chosen_stems_set.end() ) {
          d.parent_search_base = ( string( x + 1 ) + " => " );
        }
        bool bSkip = false;
        if ( c == '{' ) {
          is >> c; 
          while ( !is.eof() && c != '}' ) {
            p = y;
            while ( !is.eof() && c != '[' ) {
              *p++ = c;
              is >> c;
            }
            *p = '\0';
            is >> c; // [
            p = y_count;
            while ( !is.eof() && c != ']' ) {
              *p++ = c;
              is >> c;
            }
            *p = '\0';
            is >> c; // ,
            is >> c;
            p = xy_correlation;
            while ( !is.eof() && c != ';' ) {
              *p++ = c;
              is >> c;
            }
            *p = '\0';

            if ( !bSkip && *x != '\0' ) {

              /*
              if ( string( x ) == "ief" && string( y ) == "id" ) {
                p++;
              }
              */

              if ( bFirstPair ) {
                bFirstPair = false;
                size_t x_length = strlen( x );
                if ( x_length > prev_x_length ) {
                  // wait for shorter replacements to be processed
                  //threads.wait_idle( threads.size() );
                }
              
                /*
                if ( strcmp( x, "s" ) == 0 ) {
                  p++;
                }
                */

                for ( t_transformations::iterator transformation = transformations.begin(); !bSkip && transformation != transformations.end(); transformation++ ) {
                  string * compare_with = NULL;
                  if ( ( *transformation )->bFromStart && bReverse ) {
                    if ( ( *transformation )->from_rev.length() == 0 && ( *transformation )->from.length() != 0 ) {
                      ( *transformation )->from_rev = ( *transformation )->from;
                      reverse( ( *transformation )->from_rev.begin(), ( *transformation )->from_rev.end() );
                    }
                    compare_with = &( *transformation )->from_rev;
                  } else if ( !( *transformation )->bFromStart && !bReverse ) {
                    compare_with = &( *transformation )->from;
                  }
                  if ( 
                    compare_with != NULL
                    &&
                    x_length >= compare_with->length()
                    &&
                    strcmp( x + x_length - compare_with->length(), compare_with->c_str() ) == 0
                    &&
                    (
                      ( *transformation )->exceptions.empty()
                      ||
                      x_length <= compare_with->length()
                      ||
                      (
                        ( *transformation )->exceptions.c_str()[ 0 ] >= 'a'
                        &&
                        strchr( ( *transformation )->exceptions.c_str(), x[ x_length - compare_with->length() - 1 ] ) == NULL
                      )
                      ||
                      (
                        ( *transformation )->exceptions.c_str()[ 0 ] < 'a'
                        &&
                        strchr( ( *transformation )->exceptions.c_str(), x[ x_length - compare_with->length() - 1 ] - 32 ) != NULL
                      )
                    )
                  ) {
                    bSkip = true;
                  }
                }
              }

              if ( !bSkip ) {
                /*
                if ( string( x ) == "ief" && string( y ) == "id" ) {
                  p++;
                }
                */
                //threads.wait_idle( -WORK_QUEUE_DEPTH );
                threads.push( unstem_worker, &d, string( x ), string( y ), string( xy_correlation ), string( y_count ) );
                //unstem_worker( 0, &d, x, string( y ), string( xy_correlation ), string( y_count ) );
              }
            }

            is >> c;
          }
        }
        is >> c; // }
        //if ( counter > 10000000 ) { break; }
      }
      threads.stop( true );
    }
  }

  {
    ofstream os ( string( "./correlation_results" ) + ( bReverse ? "_rev" : "" ) + ".txt" );
    int counter = 0;
    for ( t_correlation_stats::iterator i = d.correlation_stats.end(); i != d.correlation_stats.begin() && counter < 20000; counter++ ) {
      i--;
      os << i->second->s << " (" << i->first << ")\n";
      t_correlation_stats child_correlation_stats;
      for ( int k = 0; k < alphabet_length; k++ ) {
        char letter = alphabet[ k ];
        t_correlation_stats_by_name::iterator child( d.correlation_stats_by_name.find( letter + ( " + " + i->second->s ) ) );
        if ( child != d.correlation_stats_by_name.end() ) {
          child_correlation_stats.insert( t_correlation_stats::value_type( child->second->delta, child->second ) );
        }
      }
      for ( t_correlation_stats::iterator k = child_correlation_stats.end(); k != child_correlation_stats.begin(); ) {
        k--;
        os << "  " << k->second->s << " (" << k->second->delta << ")\n";
      }
    }
  }

  ::TerminateProcess( ::GetCurrentProcess(), 0 );
}

void resort( bool bReverse ) {

  t_mutual_cor_item sample_count;
  t_mutual_cor_item sample_dict_count;
  typedef pair < size_t, size_t > t_file_record;
  typedef multimap < size_t, t_file_record > t_file_records;
  t_file_records file_records;
  string input_name( string( "./correlations" ) + ( bReverse ? "_rev" : "" ) + ".txt" );
  //string input_name( string( "./sorted_correlation_results" ) + ( bReverse ? "_rev" : "" ) + ".txt" );
  {
    ifstream is( input_name, ios::binary );
    t_i_mutual_cor i_mutual_cor;
    long long int counter = 0;
    {
      char * x = new char [ 100 ];
      unsigned long long int counter = 0;
      while ( !is.eof() && is.good() ) {
        size_t start_pos = is.tellg();
        char c = '\0';
        is >> c;
        char first_letter = c;
        size_t len = 0;
        while ( !is.eof() && c != '[' ) {
          x[ len ] = c;
          len++;
          is >> c;
        }
        x[ len ] = '\0';
        is >> c; // [
        while ( !is.eof() && c != '}' ) {
          is >> c;
        }
        if ( !is.eof() ) {
          file_records.insert( t_file_records::value_type( len * 256 + first_letter, t_file_record( start_pos, is.tellg() + 1LL ) ) );
        }
        is >> c; // }
        //if ( counter > 5000 ) { break; }
        counter++;
        if ( counter % 100 == 0 ) {
          cout << x << " (" << counter << ")" << "\n";
        }
      }
    }
  }

  {
    FILE * is = fopen( input_name.c_str(), "rb" );
    ofstream os( string( "./sorted_correlations" ) + ( bReverse ? "_rev" : "" ) + ".txt", ios::binary );
    long long int counter = 0;
    string buff;
    for ( t_file_records::iterator i = file_records.begin(); i != file_records.end(); i++ ) {
      if ( i->second.second < i->second.first ) {
        counter++;
      }
      size_t size = i->second.second - i->second.first;
      if ( buff.capacity() < size ) {
        buff.reserve( size );
      }
      _fseeki64( is, i->second.first, SEEK_SET );
      fread( ( void * )buff.c_str(), 1, size, is );
      os.write( buff.c_str(), size );
      counter++;
      if ( counter % 100 == 0 ) {
        char * p = ( char * )strchr( buff.c_str(), '[' );
        *p = '\0';
        cout << buff.c_str() << " (" << counter << ")" << "\n";
      }
    }
  }

  ::TerminateProcess( ::GetCurrentProcess(), 0 );
}

int _tmain(int argc, _TCHAR* argv[])
{
  if ( argc > 1 ) {
    wstring s( argv[ 1 ] );
    if ( s == L"bloom" ) {
      bloom();
    }
  }
  //resort( false );
  //resort( true );
  //sample_stem( false );
  //sample_stem( true );
  //unstem( false );
  //unstem( true );
  //dictionary_stem( false );
  //dictionary_stem( true );
  //dictionary_trie( false );

  /*
  iterate_bloom_full( false, "es", "" );
  iterate_bloom_full( false, "s", "" );
  iterate_bloom_full( false, "ly", "" );
  iterate_bloom_full( false, "ing", "" );
  iterate_bloom_full( false, "d", "" );
  */

  //bloom();
  //bloom( false );
  //check_bloom();
  //iterate_bloom( false );
  //iterate_bloom( true );
  /*
  for( word_limit = 10; word_limit <= 25; word_limit++ ) {
    cout << "===== " << word_limit << " =====\n";
    precheck_map.clear();
    permanent_transformations.clear();
    transformed_map.clear();
    result_map.clear();
    check_bloom_iteration();
  }
  */
  /*
  {
  nonpairs_cutoff = 17500;
    cout << "===== " << nonpairs_cutoff << " =====\n";
    precheck_map.clear();
    permanent_transformations.clear();
    transformed_map.clear();
    result_map.clear();
    total_non_pairs.clear();
    starting_non_pairs.clear();
    ending_non_pairs.clear();
    nonpairs();
    check_bloom_iteration();
  }
  */
  check_bloom_iteration( true );

  //stat();
  //nonpairs();

  return 0;
}
