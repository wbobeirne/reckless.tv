import { createLogger, transports, format } from "winston";

export const logger = createLogger({
  level: process.env.DEBUG ? "debug" : "info",
  transports: [new transports.Console()],
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: "MM-DD-YYYY HH:MM:SS" }),
    format.errors(),
    format.prettyPrint(),
    format.printf(
      info => `[${info.timestamp}] [${info.level}]: ${info.message}`,
    )
  ),
});
