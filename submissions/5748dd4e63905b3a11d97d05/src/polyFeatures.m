function out = polyFeatures(in, degree)
%POLYFEATURES returns the polynomial combinations of the columns
%
%in - a matrix (2-dimentional) to be polynomialized
%degree - the max degreee the polynomial combinations should reach
%
%out - a matrix with the same number of rows as 'in', and with a column for
%each polynomial combination of 'in''s columns, from 0-degree (a column of ones)
%to the 'degree'-degree polynomial of the last column raised to 'degree' power.


out = ones(size(in, 1), 1);
if degree==0 %stop condition - 0-degree polynomial is the ones column alone
    return
end
total_products = 1; %number of features at the end
for deg=1:degree
    total_products = total_products + num_of_products(20, deg);
end
out = [out, zeros(size(in, 1), total_products)];
start_ind = 2;
for deg=1:degree
    products_num = num_of_products(20, deg);
    out(:, start_ind:start_ind+products_num-1) = powerFeatures(in, deg);
    start_ind = start_ind + products_num;
%     for lowest_ind=1:size(in,2) %which element is the lowest that still has non-zero power
%         for lowest_power=1:deg %which pwer does it have now
%             power_remainder = deg-lowest_power;
%             lowest_powered = in(:, lowest_ind).^lowest_power;
%             rest_poly = polyFeatures(in(:, lowest_ind+1:end), power_remainder);
%             lowest_powered = repmat(lowest_powered, 1, size(rest_poly, 2));
%             out = [out, lowest_powered.*rest_poly];
%         end
%     end     
end
end

function out = powerFeatures(in, degree)
    if degree==0
        out = ones(size(in, 1), 1);
    else
        power_lower = powerFeatures(in, degree-1);
        %each element in power_lower should be multiplied by an element from
        %in. Each such multiplication is an answer for the right degree for
        %this function
        vars = size(in, 2);
        out = zeros(size(in, 1), num_of_products(vars, degree));
        start_ind = 1;
        for col=1:vars
            display(['in pwerFeatures; col=' num2str(col) '  vars=' num2str(vars)]);
            num_relevant_lower_inds = num_of_products(vars-col+1, degree-1);
            out(:, start_ind:start_ind+num_relevant_lower_inds-1) = ...
                power_lower(:, end-num_relevant_lower_inds+1:end).*repmat(in(:,col), 1, num_relevant_lower_inds);
            start_ind = start_ind + num_relevant_lower_inds;
        end
            
            
        %    repmat(power_lower(:, col), size(in, 2)-col+1
        %out = kron(power_lower, ones(1, size(in,2)).*repmat(in, 1, size(power_lower, 2)));
    end
end

function num = num_of_products(vars, degree)
%returns the number of possible products of degree 'degree' with 'vars'
%number of variables
    if degree==0
        num = 1;
    else
        num = 0;
        for i=0:vars-1
            num = num + num_of_products(vars-i, degree-1); 
        end
    end
end