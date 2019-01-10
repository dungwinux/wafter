import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import passport from "passport";

import session from "express-session";
import bodyParser from "body-parser";

import server from "./config/server";

import { info } from "./routes/info";
import { konInit } from "./routes/konInit";
import { subs } from "./routes/subs";
import { users } from "./routes/users";

import passportConfig from "./controller/passportConfig";

passportConfig(passport);
const app = express();

const PORT = server.port;

app.use(helmet());
app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        resave: false,
        saveUninitialized: true,
        secret: server.secret
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", info);
app.use("/subs", subs);
app.use("/users", users);
app.use("/kon", konInit);

app.post("/login", passport.authenticate("local"), (req, res) => {
    res.sendStatus(200);
});

app.get("/logout", (req, res) => {
    req.logout();
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Wafter is running on port ${PORT}`);
});
