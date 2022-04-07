/**
 * @file Controller RESTful Web service API for dislikes resource
 */
import { Express, Request, Response } from "express";
import DislikeDao from "../daos/DislikeDao";
import DislikeControllerI from "../interfaces/DislikeControllerI";
import TuitDao from "../daos/TuitDao";

/**
 * @class TuitController Implements RESTful Web service API for dislikes resource.
 * Defines the following HTTP endpoints:
 * <ul>
 *     <li>GET /api/users/:uid/dislikes to retrieve all the tuits disliked by a user
 *     </li>
 *     <li>PUT /api/users/:uid/dislikes/:tid to record that a user dislikes a tuit
 *     </li>
 *     <li>GET /api/users/:uid/if/dislikes/:tid to check if a user dislikes a tuit</li>
 * </ul>
 * @property {DislikeDao} dislikeDao Singleton DAO implementing likes CRUD operations
 * @property {DislikeController} DislikeController Singleton controller implementing
 * RESTful Web service API
 */
export default class DislikeController implements DislikeControllerI {
  private static dislikeDao: DislikeDao = DislikeDao.getInstance();
  private static tuitDao: TuitDao = TuitDao.getInstance();
  private static dislikeController: DislikeController | null = null;
  /**
   * Creates singleton controller instance
   * @param {Express} app Express instance to declare the RESTful Web service
   * API
   * @return TuitController
   */
  public static getInstance = (app: Express): DislikeController => {
    if (DislikeController.dislikeController === null) {
      DislikeController.dislikeController = new DislikeController();
      app.get(
        "/api/users/:uid/dislikes",
        DislikeController.dislikeController.findAllTuitsDislikedByUser
      );
      app.get(
        "/api/users/:uid/if/dislikes/:tid",
        DislikeController.dislikeController.findIfUserDislikesTuit
      );

      app.put(
        "/api/users/:uid/dislikes/:tid",
        DislikeController.dislikeController.userTogglesTuitDislikes
      );
    }
    return DislikeController.dislikeController;
  };

  private constructor() {}

  /**
   * Check if a certain user dislikes a tuit
   * @param {Request} req Represents request from client, including the
   * path parameters uid and tid representing the user that is disliking the tuit
   * and the tuit being disliked
   * @param {Response} res Represents response to client, including the
   * body formatted as JSON containing the tuit that match the condition in the
   * database
   */
  findIfUserDislikesTuit = (req: Request, res: Response) => {
    const uid = req.params.uid;
    // @ts-ignore
    const profile = req.session["profile"];
    const userId = uid === "me" && profile ? profile._id : uid;

    DislikeController.dislikeDao
      .findUserDislikesTuit(userId, req.params.tid)
      .then(dislikes => res.json(dislikes));
  };

  /**
   * Retrieves all users that disliked a tuit from the database
   * @param {Request} req Represents request from client, including the path
   * parameter tid representing the disliked tuit
   * @param {Response} res Represents response to client, including the
   * body formatted as JSON arrays containing the user objects
   */
  findAllUsersThatDislikedTuit = (req: Request, res: Response) =>
    DislikeController.dislikeDao
      .findAllUsersThatDislikedTuit(req.params.tid)
      .then(dislikes => res.json(dislikes));

  /**
   * Retrieves all tuits disliked by a user from the database
   * @param {Request} req Represents request from client, including the path
   * parameter uid representing the user disliked the tuits
   * @param {Response} res Represents response to client, including the
   * body formatted as JSON arrays containing the tuit objects that were disliked
   */
  findAllTuitsDislikedByUser = (req: Request, res: Response) => {
    const uid = req.params.uid;
    // @ts-ignore
    const profile = req.session["profile"];
    const userId = uid === "me" && profile ? profile._id : uid;

    DislikeController.dislikeDao
      .findAllTuitsDislikedByUser(userId)
      .then(dislikes => {
        const dislikesNonNullTuits = dislikes.filter(dislike => dislike.tuit);
        const tuitsFromDislikes = dislikesNonNullTuits.map(
          dislike => dislike.tuit
        );
        res.json(tuitsFromDislikes);
      });
  };

  /**
   * User toggle dislike button
   * @param {Request} req Represents request from client, including the
   * path parameters uid and tid representing the user that is disliking the tuit
   * and the tuit being disliked
   * @param {Response} res Represents response to client, including the
   * body formatted as JSON containing the new dislikes that was inserted in the
   * database
   */
  userTogglesTuitDislikes = async (req: Request, res: Response) => {
    const dislikeDao = DislikeController.dislikeDao;
    const tuitDao = DislikeController.tuitDao;
    const uid = req.params.uid;
    const tid = req.params.tid;
    // @ts-ignore
    const profile = req.session["profile"];
    const userId = uid === "me" && profile ? profile._id : uid;
    try {
      const userAlreadyDislikedTuit = await dislikeDao.findUserDislikesTuit(
        userId,
        tid
      );
      let tuit = await tuitDao.findTuitById(tid);
      if (userAlreadyDislikedTuit) {
        await dislikeDao.userUndislikesTuit(userId, tid);
        tuit.stats.dislikes += 1;
      } else {
        await dislikeDao.userDislikesTuit(userId, tid);
        tuit.stats.dislikes -= 1;
      }
      await tuitDao.updateLikes(tid, tuit.stats);
      return res.sendStatus(200).json;
    } catch (e) {
      return res.sendStatus(404).json;
    }
  };
}
