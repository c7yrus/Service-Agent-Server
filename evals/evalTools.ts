import 'dotenv/config';
import type { Score, Scorer } from 'autoevals';
import chalk from 'chalk';
import { JSONFilePreset } from 'lowdb/node';

type Run = {
  input: any;
  output: any;
  expected: any;
  scores: {
    name: Score['name'];
    score: Score['score'];
  }[];
  createdAt?: string;
};

type Set = {
  runs: Run[];
  score: number;
  createdAt: string;
};

type Experiment = {
  name: string;
  sets: Set[];
};

type Data = {
  experiments: Experiment[];
};

const defaultData: Data = {
  experiments: [],
};

const getDb = async () => {
  const db = await JSONFilePreset<Data>('results.json', defaultData);
  return db;
};

const calculateAvgScore = (runs: Run[]) => {
  if (runs.length === 0) return 0;
  const totalScores = runs.reduce((sum, run) => {
    const runAvg =
      run.scores.reduce((sum, score) => sum + score.score!, 0) /
      (run.scores.length || 1);
    return sum + runAvg;
  }, 0);
  return totalScores / runs.length;
};

export const loadExperiment = async (
  experimentName: string
): Promise<Experiment | undefined> => {
  const db = await getDb();
  return db.data.experiments.find((e) => e.name === experimentName);
};

export const saveSet = async (
  experimentName: string,
  runs: Omit<Run, 'createdAt'>[]
) => {
  const db = await getDb();

  const runsWithTimestamp: Run[] = runs.map((run) => ({
    ...run,
    createdAt: new Date().toISOString(),
  }));

  const newSet: Set = {
    runs: runsWithTimestamp,
    score: calculateAvgScore(runsWithTimestamp),
    createdAt: new Date().toISOString(),
  };

  const existingExperiment = db.data.experiments.find(
    (e) => e.name === experimentName
  );

  if (existingExperiment) {
    existingExperiment.sets.push(newSet);
  } else {
    db.data.experiments.push({
      name: experimentName,
      sets: [newSet],
    });
  }

  await db.write();
};

export const runEval = async <T = any>(
  experiment: string,
  {
    task,
    data,
    scorers,
  }: {
    task: (input: any) => Promise<T>;
    data: { input: any; expected?: T; reference?: string | string[] }[];
    scorers: Scorer<T, any>[];
  }
) => {
  const results: Run[] = await Promise.all(
    data.map(async ({ input, expected, reference }) => {
      const taskResult = await task(input);
      let context: string | string[] | undefined = undefined;
      let output: any = taskResult;

      if (
        typeof taskResult === 'object' &&
        taskResult !== null &&
        'context' in taskResult &&
        'response' in taskResult
      ) {
        context = taskResult.context as string | string[];
        output = taskResult.response;
      }

      const scores = await Promise.all(
        scorers.map(async (scorer) => {
          const score = await scorer({
            input,
            output,
            expected,
            reference,
            context,
          });
          return {
            name: score.name,
            score: score.score,
          };
        })
      );

      return {
        input,
        output,
        expected,
        scores,
      };
    })
  );

  const previousExperiment = await loadExperiment(experiment);
  const previousScore =
    previousExperiment?.sets[previousExperiment.sets.length - 1]?.score || 0;
  const currentScore = calculateAvgScore(results);
  const scoreDiff = currentScore - previousScore;

  const color = previousExperiment
    ? scoreDiff > 0
      ? chalk.green
      : scoreDiff < 0
      ? chalk.red
      : chalk.blue
    : chalk.blue;

  console.log(`Experiment: ${experiment}`);
  console.log(`Previous score: ${color(previousScore.toFixed(2))}`);
  console.log(`Current score: ${color(currentScore.toFixed(2))}`);
  console.log(
    `Difference: ${scoreDiff > 0 ? '+' : ''}${color(scoreDiff.toFixed(2))}`
  );
  console.log();

  await saveSet(experiment, results);

  return results;
};
