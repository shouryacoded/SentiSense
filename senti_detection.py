import tensorflow as tf
import numpy as np
import pandas as pd
import cv2
import keras
from keras.applications.vgg16 import VGG16, preprocess_input
from keras.applications import resnet

df1 = pd.read_csv("../fer2013.csv")
print(df1.emotion.value_counts())
print(df1.head())




