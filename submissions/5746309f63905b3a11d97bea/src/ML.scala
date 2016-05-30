
val twords = sc.textFile("wasb:///HdiSamples/words.txt").map(w => w.toLowerCase).distinct()
var fwords = sc.textFile("wasb:///HdiSamples/falseWords.txt").map(w => w.toLowerCase).distinct()
twords.cache
fwords.cache

val tq = Array.fill[Int](28)(0)
twords.flatMap(s => s.toCharArray.map(c => c.toInt - 'a'.toInt).map(d => if(d == -49) 27 else if(d == -58) 26 else d)).collect.foreach(tq(_)+=1)
val fq = Array.fill[Int](28)(0)
fwords.flatMap(s => s.toCharArray.map(c => c.toInt - 'a'.toInt).map(d => if(d == -49) 27 else if(d == -58) 26 else d)).collect.foreach(fq(_)+=1)

val fqh = tq.map(_*1.0 / tq.sum)
val tqh = tq.map(_*1.0 / tq.sum)

val tH = (tqh.zipWithIndex map { case(el, i) => (i,el) }).sortWith(_._2 > _._2).map(c => ((c._1+'a').toChar,c._2))
val fH = (fqh.zipWithIndex map { case(el, i) => (i,el) }).sortWith(_._2 > _._2).map(c => ((c._1+'a').toChar,c._2))
(tqh.sum/27,tH.take(10),fH.take(10))

twords.map(s => s.toCharArray.take(6).mkString).distinct.count

import org.apache.spark.mllib.regression.LabeledPoint
import org.apache.spark.mllib.linalg.DenseVector

val vw = Array[Char]('a','e','i','o','u', 'y')
val aBase = 'a'.toDouble

val nvw = "bcdfghjklmnpqrstvwxyz".toCharArray()
def maxl(s: String, arr: Array[Char])  =  { 
    var maxI = 0;
    var currI = 0;
    var l = s.length-1;
    for{i <- 0 to l} {
        currI = if(arr.contains(s(i))) currI + 1 else 0
        maxI = if(currI > maxI) currI else maxI
    }
    maxI.toDouble
}

def fs(s:String) : Array[Double] = {    
    val chArray = s.toCharArray
    
    val vCnt = chArray.filter(vw.contains(_)).length.toDouble
    val sCnt = chArray.filter(!vw.contains(_)).length.toDouble
    val cntRatio = if(sCnt > 0) vCnt/sCnt else 1.0
    val vowelsRatio = Array(vCnt,sCnt,cntRatio)
    
    val tagsCnt = chArray.count(c => c =='\'').toDouble
    val tagsStartPos = chArray.indexWhere( _ == '\'')
    val tagsEndPos = if(tagsStartPos >= 0) chArray.length-tagsStartPos-1 else -1
    var prevTag = if(tagsStartPos > 0) chArray(tagsStartPos-1) else 'a'+27
    prevTag = if (prevTag == '\'') 'a'+26 else prevTag
    var nextTag = if(tagsStartPos >=0 && tagsStartPos < chArray.length-1) chArray(tagsStartPos+1) else 'a'+27
    nextTag = if (nextTag == '\'') 'a'+26 else nextTag
    //val tags = Array(prevTag.toDouble - aBase, nextTag.toDouble - aBase, tagsCnt.toDouble, tagsStartPos.toDouble, tagsEndPos.toDouble)
    val tags = Array(prevTag.toDouble - aBase, nextTag.toDouble - aBase, tagsCnt.toDouble, tagsStartPos.toDouble, tagsEndPos.toDouble, if(tagsStartPos >= 0) 
                     (tagsStartPos+1.0)/chArray.length else -1)
    val w = chArray.union(Array.fill[Char](10)('0')).take(10).map(c => c.toDouble - aBase).map(d => if(d == -49.0) 27 else if(d == -58) 26 else d)
    val fq = w.map(c => tqh(c.toInt)).sum/chArray.length
    
    // length - 0
    // vCnt,sCnt,cntRatio - 1,2,3
    // w - 4-13
    // prevTag, nextTag, tagsCnt - 14-16
    // tagsStartPos, tagsEndPos, (tagsStartPos+1)/chArray.length else -1) - 17-19
    // max vw/nvw - 20,21
    // fq - 22
    // 2,18,21,15,17
    //Array(s.length().toDouble).union(vowelsRatio).union(w).union(tags)
    //Array(0.0).union(Array(0.0,0.0,0.0)).union(Array.fill[Double](10)(0.0)).union(tags)
    //Array(s.length().toDouble).union(vowelsRatio).union(w).union(tags).union(Array(maxl(s,vw),maxl(s,nvw)))
    //Array(0.0).union(Array(0.0,0.0,0.0)).union(Array.fill[Double](10)(0.0)).union(Array.fill[Double](6)(0.0)).union(Array(maxl(s,vw),maxl(s,nvw)))
    //Array(s.length().toDouble).union(vowelsRatio).union(w).union(tags).union(Array(maxl(s,vw),maxl(s,nvw))).union(Array(fq))
    //Array(0.0).union(Array(0.0,0.0,0.0)).union(Array.fill[Double](10)(0.0)).union(Array.fill[Double](6)(0.0)).union(Array.fill[Double](2)(0.0)).union(Array(fq))  
    Array(s.length().toDouble).union(vowelsRatio).union(w).union(tags).union(Array(maxl(s,vw),maxl(s,nvw))).union(Array(fq))
}


val tdata = twords.map(t => new LabeledPoint(1, new DenseVector(fs(t))))
val fdata = fwords.map(t => new LabeledPoint(0, new DenseVector(fs(t))))
val data = tdata.union(fdata)

val splits = data.randomSplit(Array(0.9, 0.1))
val (trainingData, testData) = (data,data)

val categoricalFeaturesInfo = Map[Int, Int](4 -> 28,5 -> 28,6 -> 28,7 -> 28,8 -> 28,9 -> 28,10 -> 28,11 -> 28,12 -> 28,13->28,14->28,15->28)

(twords.map(w => fs(w)).map(w => w(22)).sum/twords.count,fwords.map(w => fs(w)).map(w => w(22)).sum/fwords.count)

fs("chroma's")
model.predict(new DenseVector(fs("chroma's")))

import org.apache.spark.mllib.tree.DecisionTree
import org.apache.spark.mllib.tree.model.DecisionTreeModel
import org.apache.spark.mllib.util.MLUtils

val numClasses = 2
val impurity = "gini"
val maxDepth = 7
val maxBins = 64

val model = DecisionTree.trainClassifier(trainingData, numClasses, categoricalFeaturesInfo,
  impurity, maxDepth, maxBins)

// Evaluate model on test instances and compute test error
val labelAndPredsT = twords.map { w =>
  val prediction = model.predict(new DenseVector(fs(w)))
  (1, prediction, w)
}

val labelAndPredsF = fwords.map { w =>
  val prediction = model.predict(new DenseVector(fs(w)))
  (0, prediction, w)
}
val testErrT = labelAndPredsT.filter(r => r._1 != r._2).count.toDouble / twords.count()
val testErrF = labelAndPredsF.filter(r => r._1 != r._2).count.toDouble / fwords.count()

println("Test Succ % = " + (1-testErrT) + " " + (1-testErrF) + " " + (2-testErrT-testErrF)/2)

import org.apache.spark.mllib.tree.DecisionTree
import org.apache.spark.mllib.tree.model.DecisionTreeModel
import org.apache.spark.mllib.util.MLUtils

val numClasses = 2
val impurity = "gini"
val maxDepth = 7
val maxBins = 64

val tdata2 = labelAndPredsT.filter(r => r._1 == r._2).map(t => new LabeledPoint(1, new DenseVector(fs(t._3))))
val trainingData2 = tdata2.union(fdata)

val model2 = DecisionTree.trainClassifier(trainingData2, numClasses, categoricalFeaturesInfo,
  impurity, maxDepth, maxBins)

// Evaluate model on test instances and compute test error
val labelAndPredsT2 = twords.map { w =>
  var prediction = model.predict(new DenseVector(fs(w)))
  if(prediction == 1) prediction = model2.predict(new DenseVector(fs(w)))
  (1, prediction, w)
}

val labelAndPredsF2 = fwords.map { w =>
  var prediction = model.predict(new DenseVector(fs(w)))
  if(prediction == 1) prediction = model2.predict(new DenseVector(fs(w)))
  (0, prediction, w)
}
val testErrT2 = labelAndPredsT2.filter(r => r._1 != r._2).count.toDouble / twords.count()
val testErrF2 = labelAndPredsF2.filter(r => r._1 != r._2).count.toDouble / fwords.count()

println("Test Succ % = " + (1-testErrT2) + " " + (1-testErrF2) + " " + (2-testErrT2-testErrF2)/2)

val v1 = Array(0.0,3.0,4.0,5.0,6.0,8.0,9.0,10.0,11.0,13.0,14.0,16.0,19.0,20.0,21.0,22.0,23.0,24.0)
def pr(v:Array[Double]) = {
    println(v.map(c => {
        val k = if(c < 26) c else if(c == 26) -49.0 else -58 
        (k+'a'.toDouble).toChar
    }).mkString)
}
pr(v1)

println("Learned classification tree model:\n" + model.toDebugString)

import org.apache.spark.mllib.tree.GradientBoostedTrees
import org.apache.spark.mllib.tree.configuration.BoostingStrategy
import org.apache.spark.mllib.tree.model.GradientBoostedTreesModel
import org.apache.spark.mllib.util.MLUtils

// Train a GradientBoostedTrees model.
// The defaultParams for Classification use LogLoss by default.
val boostingStrategy = BoostingStrategy.defaultParams("Classification")
boostingStrategy.numIterations = 100 // Note: Use more iterations in practice.
boostingStrategy.treeStrategy.numClasses = 2
boostingStrategy.treeStrategy.maxDepth = 10
// Empty categoricalFeaturesInfo indicates all features are continuous.
boostingStrategy.treeStrategy.categoricalFeaturesInfo = categoricalFeaturesInfo

val model = GradientBoostedTrees.train(trainingData, boostingStrategy)


val labelAndPredsF = fwords.map { w =>
  val prediction = model.predict(new DenseVector(fs(w)))
  (0, prediction)
}
val testErrT = labelAndPredsT.filter(r => r._1 != r._2).count.toDouble / twords.count()
val testErrF = labelAndPredsF.filter(r => r._1 != r._2).count.toDouble / fwords.count()

println("Test Succ % = " + (1-testErrT) + " " + (1-testErrF) + " " + (2-testErrT-testErrF)/2)

println("Learned classification tree model:\n" + model.toDebugString.length)

// Evaluate model on test instances and compute test error
val labelAndPredsT = twords.map { w =>
  val prediction = model.predict(new DenseVector(fs(w)))
  (1, prediction)
}

val labelAndPredsF = fwords.map { w =>
  val prediction = model.predict(new DenseVector(fs(w)))
  (0, prediction)
}
val testErrT = labelAndPredsT.filter(r => r._1 != r._2).count.toDouble / twords.count()
val testErrF = labelAndPredsF.filter(r => r._1 != r._2).count.toDouble / fwords.count()

println("Test Error = " + testErrT + " " + testErrF + " " + (2-testErrT-testErrF)/2)

labelAndPreds.take(10)

import breeze.util.BloomFilter

val ct = twords.count
val bf = sc.parallelize(twords.collect).mapPartitions { iter =>
  val bf = BloomFilter.optimallySized[String](ct, 0.7)
  iter.foreach(i => bf += i)
  Iterator(bf)
}.reduce(_ | _)

val testErrT = fwords.filter(r => bf.contains(r)).count.toDouble / twords.count()
println("Test Error = " + testErrT)

BloomFilter.optimalSize(ct,0.3)

// Evaluate model on test instances and compute test error
val labelAndPredsT = twords.map { w =>
  var prediction = model.predict(new DenseVector(fs(w)))
  if(prediction == 1 && !bf.contains(w)) prediction = 0                              
  (1, prediction)
}
val testErr = labelAndPreds.filter(r => r._1 != r._2).count.toDouble / twords.count()

val labelAndPredsF = fwords.map { w =>
  var prediction = model.predict(new DenseVector(fs(w)))
  if(prediction == 1 && !bf.contains(w)) prediction = 0                              
  (0, prediction)
}
val testErrT = labelAndPredsT.filter(r => r._1 != r._2).count.toDouble / twords.count()
val testErrF = labelAndPredsF.filter(r => r._1 != r._2).count.toDouble / fwords.count()

println("Test Error = " + testErrT + " " + testErrF + " " + (2 - testErrT-testErrF)/2)

println("Learned classification tree model:\n" + model.toDebugString)

import org.apache.spark.ml.Pipeline
import org.apache.spark.ml.classification.DecisionTreeClassifier
import org.apache.spark.ml.classification.DecisionTreeClassificationModel
import org.apache.spark.ml.feature.{StringIndexer, IndexToString, VectorIndexer}
import org.apache.spark.ml.evaluation.MulticlassClassificationEvaluator

// Index labels, adding metadata to the label column.
// Fit on whole dataset to include all labels in index.
import sqlContext.implicits._

val labelIndexer = new StringIndexer().setInputCol("label").setOutputCol("indexedLabel").fit(data.toDF)
// Automatically identify categorical features, and index them.
 // features with > 4 distinct values are treated as continuous

val featureIndexer = new VectorIndexer().setInputCol("features").setOutputCol("indexedFeatures").setMaxCategories(27).fit(data.toDF)

// Train a DecisionTree model.
val dt = new DecisionTreeClassifier().setLabelCol("indexedLabel").setFeaturesCol("indexedFeatures")

// Convert indexed labels back to original labels.
val labelConverter = new IndexToString().setInputCol("prediction").setOutputCol("predictedLabel").setLabels(labelIndexer.labels)

// Chain indexers and tree in a Pipeline
val pipeline = new Pipeline().setStages(Array(labelIndexer, featureIndexer, dt, labelConverter))

// Train model.  This also runs the indexers.
val model = pipeline.fit(trainingData.toDF)

// Make predictions.
val predictions = model.transform(testData.toDF)

// Select example rows to display.
predictions.select("predictedLabel", "label", "features").show(5)

// Select (prediction, true label) and compute test error
val evaluator = new MulticlassClassificationEvaluator().setLabelCol("indexedLabel").setPredictionCol("prediction").setMetricName("precision")
val accuracy = evaluator.evaluate(predictions)
/*
val treeModel = model.stages(2).asInstanceOf[DecisionTreeClassificationModel]
println("Learned classification tree model:\n" + treeModel.toDebugString)*/
println("Test Error = " + (1.0 - accuracy))

import org.apache.spark.ml.Pipeline
import org.apache.spark.ml.classification.{RandomForestClassificationModel, RandomForestClassifier}
import org.apache.spark.ml.evaluation.MulticlassClassificationEvaluator
import org.apache.spark.ml.feature.{IndexToString, StringIndexer, VectorIndexer}

// Index labels, adding metadata to the label column.
// Fit on whole dataset to include all labels in index.
import sqlContext.implicits._

val labelIndexer = new StringIndexer().setInputCol("label").setOutputCol("indexedLabel").fit(data.toDF)
// Automatically identify categorical features, and index them.
 // features with > 4 distinct values are treated as continuous

val featureIndexer = new VectorIndexer().setInputCol("features").setOutputCol("indexedFeatures").setMaxCategories(27).fit(data.toDF)

// Train a DecisionTree model.
val dt = new RandomForestClassifier().setLabelCol("indexedLabel").setFeaturesCol("indexedFeatures").setNumTrees(10)

// Convert indexed labels back to original labels.
val labelConverter = new IndexToString().setInputCol("prediction").setOutputCol("predictedLabel").setLabels(labelIndexer.labels)

// Chain indexers and tree in a Pipeline
val pipeline = new Pipeline().setStages(Array(labelIndexer, featureIndexer, dt, labelConverter))

// Train model.  This also runs the indexers.
val model = pipeline.fit(trainingData.toDF)

// Make predictions.
val predictions = model.transform(testData.toDF)

// Select example rows to display.
predictions.select("predictedLabel", "label", "features").show(5)

// Select (prediction, true label) and compute test error
val evaluator = new MulticlassClassificationEvaluator().setLabelCol("indexedLabel").setPredictionCol("prediction").setMetricName("precision")
val accuracy = evaluator.evaluate(predictions)
/*
val treeModel = model.stages(2).asInstanceOf[DecisionTreeClassificationModel]
println("Learned classification tree model:\n" + treeModel.toDebugString)*/
println("Test Error = " + (1.0 - accuracy))

import org.apache.spark.ml.classification.MultilayerPerceptronClassifier
import org.apache.spark.ml.evaluation.MulticlassClassificationEvaluator
import sqlContext.implicits._

val splits = data.randomSplit(Array(0.9, 0.1), seed = 1234L)
val train = splits(0)
val test = splits(1)
// specify layers for the neural network:
// input layer of size 4 (features), two intermediate of size 5 and 4
// and output of size 3 (classes)
val layers = Array[Int](23, 25, 15, 7, 2)
// create the trainer and set its parameters
val trainer = new MultilayerPerceptronClassifier().setLayers(layers).setBlockSize(128).setSeed(1234L).setMaxIter(5000)
// train the model
val model = trainer.fit(train.toDF)
// compute precision on the test set
val result = model.transform(test.toDF)
val predictionAndLabels = result.select("prediction", "label")
val evaluator = new MulticlassClassificationEvaluator().setMetricName("precision")
println("Precision:" + evaluator.evaluate(predictionAndLabels))

import sqlContext.implicits._

val labelAndPredsT = model.transform(twords.map(t => new LabeledPoint(1, new DenseVector(fs(t)))).toDF)
val labelAndPredsF = model.transform(fwords.map(t => new LabeledPoint(0, new DenseVector(fs(t)))).toDF)

val testErrT = labelAndPredsT.filter("prediction != 1.0").count.toDouble / twords.count()
val testErrF = labelAndPredsF.filter("prediction != 0.0").count.toDouble / fwords.count()

println("Test Error = " + testErrT + " " + testErrF + " " + (2-testErrT-testErrF)/2)

labelAndPredsF.show


