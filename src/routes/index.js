import express from "express";

const router = express.Router();

// Define your v1 routes here
router.get("/", (req, res) => {
    res.send("Hello from v1!");
});

export default router;