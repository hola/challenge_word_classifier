training_set = [words_cors ; nonwords_cors];
training_set_val = [ones(size(words_cors, 1), 1); zeros(size(nonwords_cors, 1), 1)];

%mapped_nonwords_cors = polyFeatures(nonwords_cors, 2);

mapped_training_set = polyFeatures(training_set, 2);

options = optimset('GradObj', 'on', 'MaxIter', 10);
initial_theta = zeros(size(mapped_training_set, 2), 1); %rand(size(mapped_training_set, 2), 1);
rounds = 1;
theta = zeros(size(mapped_training_set, 2), rounds);
cost = zeros(rounds, 1);
for i=1:rounds
    [theta(:, i), cost(i)] = fminunc(@(t) (costFunction(t, mapped_training_set, training_set_val)), initial_theta, options);
    initial_theta = theta(:, i);
end

predicted = predict(theta, mapped_training_set);
predicted_round = round(predicted);
truePos = (predicted_round==1 & training_set_val==1);
trueNeg = (predicted_round==0 & training_set_val==0);
falsePos = (predicted_round==1 & training_set_val==0);
falseNeg = (predicted_round==0 & training_set_val==1);