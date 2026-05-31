import type { ModuleContent } from "../types";

export const descriptiveModule: ModuleContent = {
    topicId: "descriptive",
    title: "Descriptive Statistics",
    intro: [
      "Descriptive statistics is the art of summarizing raw data into meaningful numbers and visuals. Before you can make predictions or test theories, you need to know what your data looks like.",
      "The two big questions are always the same: where is the center of the data, and how spread out is it? Answering these two questions well tells you most of what you need to know.",
      "We will cover measures of central tendency (mean, median, mode), measures of spread (range, variance, standard deviation), and how to visualize distributions.",
    ],
    sections: [
      {
        title: "Measures of central tendency",
        section: "median",
        body: [
          "The mean (arithmetic average) is $\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i$. It uses every data point, which makes it sensitive to extreme values (outliers). One unusually large value can pull the mean far from the typical observation.",
          "The median is the middle value when data is sorted in order. For an even number of observations, it is the average of the two middle values. The median is resistant to outliers: adding one extreme value does not change it much. This makes it the preferred measure of center for skewed data such as income, house prices, or reaction times.",
          "The mode is the most frequently occurring value. A dataset can be unimodal (one mode), bimodal (two modes), or multimodal. The mode is the only measure of center applicable to categorical data — you can find the most common hair colour, but a 'mean hair colour' is meaningless.",
          "Relationship to skewness: for a right-skewed (positively skewed) distribution, the mean is greater than the median, which is greater than the mode. For a left-skewed distribution the order reverses. For a perfectly symmetric distribution, all three coincide.",
          "The weighted mean: $\\bar{x}_w = \\frac{\\sum w_i x_i}{\\sum w_i}$. Used when different observations have different importances — for example, computing a course grade where assignments, midterm, and final carry different percentage weights.",
        ],
        eli5: [
          "You and four friends have different amounts of candy: $2, 3, 7, 7, 9$. The mean ($5.6$) is how much each would get if you pooled and shared equally. The median ($7$) is what the middle person has when you line up from least to most. The mode ($7$) is what the most people have.",
          "The mean is like a balance point: put weights at each value and the mean is where the seesaw balances. One very heavy weight (an outlier) yanks the balance point toward it. The median ignores extreme values and just asks 'who is in the exact middle?'",
        ],
        examples: [
          {
            title: "Mean, median, mode",
            steps: [
              "Data: $\\{3, 7, 7, 2, 9\\}$.",
              "Mean: $(3+7+7+2+9)/5 = 28/5 = 5.6$.",
              "Sorted: $\\{2,3,7,7,9\\}$. Median: middle value $= 7$.",
              "Mode: $7$ (appears twice, all others once).",
              "The mean ($5.6$) and median ($7$) differ — the value $2$ pulls the mean down slightly.",
            ],
          },
        ],
      },
      {
        title: "Measures of spread",
        section: "variance",
        body: [
          "The range $= \\max - \\min$ is the simplest measure of spread. It only uses two data points and is badly distorted by a single outlier. If the maximum salary in a sample is a CEO at \\$5,000,000, the range tells you almost nothing about the typical spread.",
          "Variance measures the average squared deviation from the mean. Population variance: $\\sigma^2 = \\frac{1}{N}\\sum_{i=1}^N (x_i-\\mu)^2$. Sample variance uses $n-1$ in the denominator: $s^2 = \\frac{1}{n-1}\\sum_{i=1}^n(x_i-\\bar{x})^2$. The $n-1$ correction (Bessel's correction) makes $s^2$ an unbiased estimator of $\\sigma^2$.",
          "Standard deviation $s = \\sqrt{s^2}$ restores the original units. A standard deviation of $10$ kg means the typical observation is about $10$ kg away from the mean. Unlike variance, you can directly compare the standard deviation to the data values.",
          "The interquartile range $\\text{IQR} = Q_3 - Q_1$ captures the spread of the middle $50\\%$ of the data. It is unaffected by the most extreme values and is the natural measure of spread to pair with the median.",
          "The coefficient of variation $\\text{CV} = s/\\bar{x}$ expresses the standard deviation as a fraction of the mean. It allows comparing spread between datasets measured on different scales — e.g., heights of adults vs. heights of buildings.",
        ],
        eli5: [
          "Standard deviation tells you how scattered the data is around the mean. Small $\\sigma$ means everyone is close to the average (a tight cluster). Large $\\sigma$ means values are all over the place. Think of the mean as the centre of a target and $\\sigma$ as the average distance from the bullseye.",
          "Why divide by $n-1$ for sample variance? When you estimate the mean from the same data, the deviations from $\\bar{x}$ are systematically a tiny bit smaller than deviations from the true $\\mu$. Dividing by $n-1$ instead of $n$ corrects for that bias.",
        ],
        examples: [
          {
            title: "Sample variance and standard deviation",
            steps: [
              "Data: $\\{2, 4, 4, 4, 5, 5, 7, 9\\}$, $n=8$, $\\bar{x}=5$.",
              "Squared deviations: $(2-5)^2=9$, $(4-5)^2=1\\times 3=3$, $(5-5)^2=0\\times 2=0$, $(7-5)^2=4$, $(9-5)^2=16$.",
              "Sum of squared deviations $= 9+3+0+4+16 = 32$.",
              "Sample variance: $s^2 = 32/(8-1) = 32/7 \\approx 4.57$.",
              "Sample standard deviation: $s = \\sqrt{4.57} \\approx 2.14$.",
            ],
          },
        ],
      },
      {
        title: "Data visualization",
        section: "visualization",
        body: [
          "Histograms group continuous data into bins (intervals) and plot the frequency or density of each bin. They reveal the shape of a distribution: symmetric, right-skewed, left-skewed, bimodal, or uniform. The shape guides which summary statistics are appropriate.",
          "Box plots (box-and-whisker plots) display five numbers: minimum, $Q_1$, median, $Q_3$, maximum, and mark outliers as individual points. They make it easy to compare distributions across multiple groups, and they immediately reveal skewness and outliers.",
          "Dot plots and stem-and-leaf plots show every individual value and are useful for small datasets (fewer than ~30 observations). They preserve more information than histograms.",
          "Scatter plots show the joint distribution of two quantitative variables. The pattern — linear, curved, no pattern, tight, loose — guides the choice of model and whether correlation is appropriate.",
          "Skewness and the mean-median relationship: in a right-skewed distribution the mean exceeds the median (the long tail of high values pulls the mean right). In a left-skewed distribution the mean is below the median. For symmetric distributions mean $\\approx$ median.",
        ],
        eli5: [
          "A histogram is like sorting coloured marbles into trays by size: you instantly see which sizes are most common and how the sizes spread out. A box plot is like a quick summary card showing: here is the lowest score, here is the bottom quarter, here is the middle, here is the top quarter, and here is the top. Outliers get their own dots.",
        ],
      },
      {
        title: "Percentiles and the five-number summary",
        section: "percentiles",
        body: [
          "The $p$-th percentile is the value below which approximately $p\\%$ of observations fall. The median is the $50$th percentile; $Q_1$ is the $25$th, $Q_3$ is the $75$th.",
          "The five-number summary $\\{\\min, Q_1, \\text{median}, Q_3, \\max\\}$ concisely describes the center and spread of a distribution and is the foundation of the box plot.",
          "$\\text{IQR} = Q_3 - Q_1$ measures the spread of the central half of the data. The standard outlier rule: a value is a (mild) outlier if it lies below $Q_1 - 1.5\\,\\text{IQR}$ or above $Q_3 + 1.5\\,\\text{IQR}$, and an extreme outlier if it exceeds $Q_1 - 3\\,\\text{IQR}$ or $Q_3 + 3\\,\\text{IQR}$.",
          "Percentiles are used in standardised testing (your score falls in the $85$th percentile), growth charts (a child's height is in the $60$th percentile), and risk management (the $99$th percentile of losses).",
        ],
        eli5: [
          "If you score in the $90$th percentile on a test, $90\\%$ of test-takers scored below you. You didn't necessarily get $90\\%$ of the questions right — percentile rank is about where you stand relative to other people, not your raw score.",
        ],
      },
      {
        title: "Choosing the right summary",
        section: "mean",
        body: [
          "Symmetric distributions with no outliers: use mean and standard deviation. They use all the data and have convenient mathematical properties.",
          "Skewed distributions or data with outliers: use median and IQR. These are resistant to the extreme values that distort the mean and standard deviation.",
          "Always visualise your data before computing summaries. Summary statistics can be deceptive: Anscombe's quartet shows four datasets with identical means, variances, and correlations but completely different shapes.",
          "For categorical or ordinal data, the mode is the only sensible measure of center. Report counts and proportions rather than means.",
        ],
        eli5: [
          "Mean and standard deviation work beautifully for nice, symmetric data. But if your data has extreme outliers (like salaries including a billionaire), they are misleading. In that case, use median and IQR — they just describe the typical middle without being dragged off by extremes.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Confusing population variance ($\\div N$) with sample variance ($\\div (n-1)$). In virtually all real applications you have a sample, so use $n-1$.",
      "Reporting the mean for heavily skewed data. For income, house prices, or any right-skewed data, the median better represents the typical value.",
      "Forgetting to sort data before computing the median or quartiles.",
      "Interpreting standard deviation as a percentage. It has the same units as the raw data. A standard deviation of $5$ kg means typical values deviate by $5$ kg from the mean, not $5\\%$.",
      "Using the range as the primary measure of spread. One outlier distorts it completely. Prefer IQR or standard deviation.",
    ],
  };
