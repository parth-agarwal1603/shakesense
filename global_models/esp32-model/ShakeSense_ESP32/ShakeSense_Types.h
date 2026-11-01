#pragma once

struct Features {
  float mean;
  float rms;
  float peakToPeak;
  float kurtosis;
  float crestFactor;
  float temperature;
};

struct Detection {
  bool abnormal;
  float maxAbsRobustZ;
};
