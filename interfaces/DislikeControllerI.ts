import { Request, Response } from "express";

/**
 * @file Declares API for DislikeController
 */
export default interface DislikeControllerI {
  findAllUsersThatDislikedTuit(req: Request, res: Response): void;
  findAllTuitsDislikedByUser(req: Request, res: Response): void;
  userTogglesTuitDislikes(req: Request, res: Response): void;
  findIfUserDislikesTuit(req: Request, res: Response): void;
}
