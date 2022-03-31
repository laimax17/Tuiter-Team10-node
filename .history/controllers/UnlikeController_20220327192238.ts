/**
 * @file Controller RESTful Web service API for Dislikes resource
 */
 import {Express, Request, Response} from "express";
 import DislikeDao from "../daos/DislikeDao";
 import DislikeControllerI from "../interfaces/DislikeControllerI";
 import TuitDao from "../daos/TuitDao";
 
 /**
  * @class TuitController Implements RESTful Web service API for Dislikes resource.
  * Defines the following HTTP endpoints:
  * <ul>
  *     <li>GET /api/users/:uid/Dislikes to retrieve all the tuits Disliked by a user
  *     </li>
  *     <li>GET /api/tuits/:tid/Dislikes to retrieve all users that Disliked a tuit
  *     </li>
  *     <li>POST /api/users/:uid/Dislikes/:tid to record that a user Dislikes a tuit
  *     </li>
  *     <li>DELETE /api/users/:uid/unDislikes/:tid to record that a user
  *     no londer Dislikes a tuit</li>
  * </ul>
  * @property {DislikeDao} DislikeDao Singleton DAO implementing Dislikes CRUD operations
  * @property {DislikeController} DislikeController Singleton controller implementing
  * RESTful Web service API
  */
 export default class DislikeController implements DislikeControllerI {
     private static DislikeDao: DislikeDao = DislikeDao.getInstance();
     private static tuitDao: TuitDao = TuitDao.getInstance();
     private static DislikeController: DislikeController | null = null;
     /**
      * Creates singleton controller instance
      * @param {Express} app Express instance to declare the RESTful Web service
      * API
      * @return TuitController
      */
     public static getInstance = (app: Express): DislikeController => {
         if(DislikeController.DislikeController === null) {
             DislikeController.DislikeController = new DislikeController();
             app.get("/api/users/:uid/Dislikes", DislikeController.DislikeController.findAllTuitsDislikedByUser);
             app.get("/api/tuits/:tid/Dislikes", DislikeController.DislikeController.findAllUsersThatDislikedTuit);
             app.put("/api/users/:uid/Dislikes/:tid", DislikeController.DislikeController.userTogglesTuitDislikes);
         }
         return DislikeController.DislikeController;
     }
 
     private constructor() {}
 
     /**
      * Retrieves all users that Disliked a tuit from the database
      * @param {Request} req Represents request from client, including the path
      * parameter tid representing the Disliked tuit
      * @param {Response} res Represents response to client, including the
      * body formatted as JSON arrays containing the user objects
      */
     findAllUsersThatDislikedTuit = (req: Request, res: Response) =>
         DislikeController.DislikeDao.findAllUsersThatDislikedTuit(req.params.tid)
             .then(Dislikes => res.json(Dislikes));
 
     /**
      * Retrieves all tuits Disliked by a user from the database
      * @param {Request} req Represents request from client, including the path
      * parameter uid representing the user Disliked the tuits
      * @param {Response} res Represents response to client, including the
      * body formatted as JSON arrays containing the tuit objects that were Disliked
      */
     findAllTuitsDislikedByUser = (req: Request, res: Response) => {
         const uid = req.params.uid;
         // @ts-ignore
         const profile = req.session['profile'];
         const userId = uid === "me" && profile ?
             profile._id : uid;
 
         DislikeController.DislikeDao.findAllTuitsDislikedByUser(userId)
             .then(Dislikes => {
                 const DislikesNonNullTuits = Dislikes.filter(Dislike => Dislike.tuit);
                 const tuitsFromDislikes = DislikesNonNullTuits.map(Dislike => Dislike.tuit);
                 res.json(tuitsFromDislikes);
             });
     }
 
     
     /**
      * @param {Request} req Represents request from client, including the
      * path parameters uid and tid representing the user that is liking the tuit
      * and the tuit being Disliked
      * @param {Response} res Represents response to client, including the
      * body formatted as JSON containing the new Dislikes that was inserted in the
      * database
      */
     userTogglesTuitDislikes = async (req: Request, res: Response) => {
         const DislikeDao = DislikeController.DislikeDao;
         const tuitDao = DislikeController.tuitDao;
         const uid = req.params.uid;
         const tid = req.params.tid;
         // @ts-ignore
         const profile = req.session['profile'];
         const userId = uid === "me" && profile ?
             profile._id : uid;
         try {
             const userAlreadyDislikedTuit = await DislikeDao.findUserDislikesTuit(userId, tid);
             const howManyDislikedTuit = await DislikeDao.countHowManyDislikedTuit(tid);
             let tuit = await tuitDao.findTuitById(tid);
             if (userAlreadyDislikedTuit) {
                 await DislikeDao.userUnDislikesTuit(userId, tid);
                 tuit.stats.Dislikes = howManyDislikedTuit - 1;
             } else {
                 await DislikeController.DislikeDao.userDislikesTuit(userId, tid);
                 tuit.stats.Dislikes = howManyDislikedTuit + 1;
             };
             await tuitDao.updateDislikes(tid, tuit.stats);
             res.sendStatus(200);
         } catch (e) {
             res.sendStatus(404);
         }
     }
 };