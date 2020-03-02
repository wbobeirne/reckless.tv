import { logger } from "../logger";

export function makeRepeatedTask(name: string, taskFn: Function, interval: number) {
  return () => {
    logger.debug(`Starting task ${name} to be repeated every ${interval / 1000} seconds`);
    const recursiveTask = () => {
      setTimeout(async () => {
        try {
          await taskFn();
        } catch (err) {
          logger.error(`Task ${name} encountered an error:`, err);
        }
        recursiveTask();
      }, interval);
    };
    recursiveTask();
  };
}
