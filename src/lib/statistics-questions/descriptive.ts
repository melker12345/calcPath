import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const descriptiveProblems: Problem[] = [
  p({ id: "desc-mean-1", topicId: "descriptive", section: "mean", type: "numeric", difficulty: "easy",
    prompt: "Find the mean of the data set: $\\{4, 8, 6, 5, 7\\}$",
    answer: "6",
    explanation: "Step 1: Sum the values: $4 + 8 + 6 + 5 + 7 = 30$. Step 2: Divide by the number of values: $30 / 5 = 6$. Final answer: $6$." }),
  p({ id: "desc-median-1", topicId: "descriptive", section: "median", type: "numeric", difficulty: "easy",
    prompt: "Find the median of: $\\{3, 7, 1, 9, 5\\}$",
    answer: "5",
    explanation: "Step 1: Sort the data in ascending order: $1, 3, 5, 7, 9$. Step 2: The middle value (3rd of 5) is $5$. Final answer: $5$." }),
  p({ id: "desc-variance-1", topicId: "descriptive", section: "variance", type: "numeric", difficulty: "medium",
    prompt: "Find the population variance of: $\\{2, 4, 4, 4, 5, 5, 7, 9\\}$. The mean is $5$.",
    answer: "4",
    explanation: "Step 1: Compute each squared deviation: $(2-5)^2=9,\\;(4-5)^2=1,\\;(4-5)^2=1,\\;(4-5)^2=1,\\;(5-5)^2=0,\\;(5-5)^2=0,\\;(7-5)^2=4,\\;(9-5)^2=16$. Step 2: Sum: $9+1+1+1+0+0+4+16=32$. Step 3: Divide by $N=8$: $32/8=4$. Final answer: $4$." }),
  p({ id: "desc-stdev-1", topicId: "descriptive", section: "variance", type: "numeric", difficulty: "medium",
    prompt: "The population variance of a dataset is $16$. What is the population standard deviation?",
    answer: "4",
    explanation: "Step 1: Standard deviation is the square root of variance. Step 2: $\\sigma = \\sqrt{16} = 4$. Final answer: $4$." }),
  p({ id: "desc-range-1", topicId: "descriptive", section: "mean", type: "numeric", difficulty: "easy",
    prompt: "Find the range of: $\\{12, 5, 8, 20, 3\\}$",
    answer: "17",
    explanation: "Step 1: Identify the maximum: $20$. Step 2: Identify the minimum: $3$. Step 3: Range $= 20 - 3 = 17$. Final answer: $17$." }),
];
