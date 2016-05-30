function p = predict(theta, X)
%PREDICT Predict whether the label is 0 or 1 using learned logistic 
%regression parameters theta
%   p = PREDICT(theta, X) computes the predictions for X using a 
%   threshold at 0.5 (i.e., if sigmoid(theta'*x) >= 0.5, predict 1)

m = size(X, 1); % Number of training examples

% You need to return the following variables correctly
p = zeros(m, 1);

% ====================== YOUR CODE HERE ======================
% Instructions: Complete the following code to make predictions using
%               your learned logistic regression parameters. 
%               You should set p to a vector of 0's and 1's
%
p = X*theta;
p = p + (p==0); %put 1 instead of 0 - to allow division (and clasify those on the decision border as positive)
p = p ./ abs(p); % results are +-1 (negative -1 ; positive 1) 
p = (p + 1) ./ 2; %reparametrize (-1,1)->(0,1)



% =========================================================================


end
