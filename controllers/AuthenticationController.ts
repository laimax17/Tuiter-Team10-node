import { Request, Response, Express } from "express";
import UserDao from "../daos/UserDao";
const bcrypt = require("bcrypt");
const saltRounds = 10;

const AuthenticationController = (app: Express) => {
  const userDao: UserDao = UserDao.getInstance();

  const login = async (req: Request, res: Response) => {
    console.log("==> login");
    console.log("==> req.session");
    console.log(req.session);

    const user = req.body;
    const username = user.username;
    const password = user.password;
    const existingUser = await userDao.findUserByUsername(username);
    const match = await bcrypt.compare(password, existingUser.password);

    if (match) {
      delete existingUser.password;
      // @ts-ignore
      req.session["profile"] = existingUser;
      res.json(existingUser);
    } else {
      res.sendStatus(403);
    }
  };

  const register = async (req: Request, res: Response) => {
    console.log("==> register");
    console.log("==> req.session");
    console.log(req.session);

    const newUser = req.body;
    const username = newUser.username;
    const password = newUser.password;
    const email = newUser.email;
    if (username == "" || password == "" || email == "") {
      res.sendStatus(403);
      return;
    }
    const hash = await bcrypt.hash(password, saltRounds);
    newUser.password = hash;

    const existingUser = await userDao.findUserByUsername(username);
    if (existingUser) {
      res.sendStatus(403);
      return;
    } else {
      const insertedUser = await userDao.createUser(newUser);
      delete insertedUser.password;

      // @ts-ignore
      req.session["profile"] = insertedUser;
      res.json(insertedUser);
    }
  };

  const profile = async (req: Request, res: Response) => {
    // @ts-ignore
    const profile = req.session["profile"];
    if (profile) {
      const existingUser = await userDao.findUserByUsername(profile.username);
      // @ts-ignore
      req.session["profile"] = existingUser;
      res.json(existingUser);
    } else {
      res.sendStatus(403);
    }
  };

  const logout = (req: Request, res: Response) => {
    // @ts-ignore
    req.session.destroy();
    res.sendStatus(200);
  };

  app.post("/api/auth/login", login);
  app.post("/api/auth/register", register);
  app.post("/api/auth/profile", profile);
  app.post("/api/auth/logout", logout);
};

export default AuthenticationController;
