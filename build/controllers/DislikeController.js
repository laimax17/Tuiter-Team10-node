"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DislikeDao_1 = __importDefault(require("../daos/DislikeDao"));
const TuitDao_1 = __importDefault(require("../daos/TuitDao"));
const LikeDao_1 = __importDefault(require("../daos/LikeDao"));
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
class DislikeController {
    //  public static getDislikeDaoInstance : DislikeDao = DislikeDao.getInstance();
    constructor() {
        /**
         * Retrieves all users that Disliked a tuit from the database
         * @param {Request} req Represents request from client, including the path
         * parameter tid representing the Disliked tuit
         * @param {Response} res Represents response to client, including the
         * body formatted as JSON arrays containing the user objects
         */
        this.findAllUsersThatDislikedTuit = (req, res) => DislikeController.dislikeDao.findAllUsersThatDislikedTuit(req.params.tid)
            .then(Dislikes => res.json(Dislikes));
        /**
         * Retrieves all tuits Disliked by a user from the database
         * @param {Request} req Represents request from client, including the path
         * parameter uid representing the user Disliked the tuits
         * @param {Response} res Represents response to client, including the
         * body formatted as JSON arrays containing the tuit objects that were Disliked
         */
        this.findAllTuitsDislikedByUser = (req, res) => {
            const uid = req.params.uid;
            // @ts-ignore
            const profile = req.session['profile'];
            const userId = uid === "me" && profile ?
                profile._id : uid;
            DislikeController.dislikeDao.findAllTuitsDislikedByUser(userId)
                .then(Dislikes => {
                const DislikesNonNullTuits = Dislikes.filter(Dislike => Dislike.tuit);
                const tuitsFromDislikes = DislikesNonNullTuits.map(Dislike => Dislike.tuit);
                res.json(tuitsFromDislikes);
            });
        };
        /**
         * @param {Request} req Represents request from client, including the
         * path parameters uid and tid representing the user that is liking the tuit
         * and the tuit being Disliked
         * @param {Response} res Represents response to client, including the
         * body formatted as JSON containing the new Dislikes that was inserted in the
         * database
         */
        this.userTogglesTuitDislikes = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const dislikeDao = DislikeController.dislikeDao;
            const tuitDao = DislikeController.tuitDao;
            const likeDao = DislikeController.likeDao;
            const uid = req.params.uid;
            const tid = req.params.tid;
            // @ts-ignore
            const profile = req.session['profile'];
            const userId = uid === "me" && profile ?
                profile._id : uid;
            try {
                const userAlreadyDislikedTuit = yield dislikeDao.findUserDislikesTuit(userId, tid);
                const howManyDislikedTuit = yield dislikeDao.countHowManyDislikedTuit(tid);
                const howManyLikedTuit = yield likeDao.countHowManyLikedTuit(tid);
                const userAlreadyLikedTuit = yield likeDao.findUserLikesTuit(userId, tid);
                let tuit = yield tuitDao.findTuitById(tid);
                if (userAlreadyDislikedTuit) {
                    yield dislikeDao.userUnDislikesTuit(userId, tid);
                    tuit.stats.dislikes = howManyDislikedTuit - 1;
                }
                else {
                    yield DislikeController.dislikeDao.userDislikesTuit(userId, tid);
                    tuit.stats.dislikes = howManyDislikedTuit + 1;
                    if (userAlreadyLikedTuit) {
                        yield likeDao.userUnlikesTuit(userId, tid);
                        tuit.stats.likes = howManyLikedTuit - 1;
                    }
                }
                ;
                yield tuitDao.updateDislikes(tid, tuit.stats);
                res.sendStatus(200);
            }
            catch (e) {
                res.sendStatus(404);
            }
        });
        /**
        * Find if a user has disliked a tuit or not
        * @param req Represents request from client, including the
        * path parameters uid and tid representing the user that is liking the tuit
        * and the tuit being liked
        * @param res Represents response to client, including the
        * body formatted as JSON containing the new likes that was inserted in the
        * database
        */
        this.findUserDislikesTuit = (req, res) => {
            const uid = req.params.uid;
            const tid = req.params.tid;
            // @ts-ignore
            const profile = req.session['profile'];
            const userId = uid === "me" && profile ?
                profile._id : uid;
            DislikeController.dislikeDao.findUserDislikesTuit(userId, tid)
                .then(dislikes => res.json(dislikes));
        };
    }
}
exports.default = DislikeController;
DislikeController.dislikeDao = DislikeDao_1.default.getInstance();
DislikeController.tuitDao = TuitDao_1.default.getInstance();
DislikeController.dislikeController = null;
DislikeController.likeDao = LikeDao_1.default.getInstance();
/**
 * Creates singleton controller instance
 * @param {Express} app Express instance to declare the RESTful Web service
 * API
 * @return TuitController
 */
DislikeController.getInstance = (app) => {
    if (DislikeController.dislikeController === null) {
        DislikeController.dislikeController = new DislikeController();
        app.get("/api/users/:uid/dislikes", DislikeController.dislikeController.findAllTuitsDislikedByUser);
        app.get("/api/tuits/:tid/dislikes", DislikeController.dislikeController.findAllUsersThatDislikedTuit);
        app.put("/api/users/:uid/dislikes/:tid", DislikeController.dislikeController.userTogglesTuitDislikes);
        app.get("/api/users/:uid/hasDisliked/:tid", DislikeController.dislikeController.findUserDislikesTuit);
    }
    return DislikeController.dislikeController;
};
;
