import express from "express";
import UserRoute from "./user/routes";

const router = express.Router();

router.use("/user", UserRoute);

export default router;
