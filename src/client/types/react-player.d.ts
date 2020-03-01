// Export the submodules that don't have types
declare module "react-player/lib/players/FilePlayer" {
  import ReactPlayer from "react-player";
  export class FilePlayer extends ReactPlayer {}
}
