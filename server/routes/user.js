const express = require("express");
const { check, body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("../config/config");
const {
  setExperience,
  updateCredits,
  unassignThread,
  editName,
  getUserActivity,
  uploadAvatar
} = require("../controllers/user");
const matchingQueue = require("../services/matchingQueue");
const { User, Thread } = require("../database");
const stripe = require("stripe")(config.stripe.stripeSecret);
const mongoose = require("mongoose");
const isAuth = config.server.isAuth;
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/signup",
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Please use a valid email address").isEmail(),
    check("password", "Choose a password at least 6 characters long").isLength({
      min: 6
    }),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.length > 0) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
      //Check for an existing user
      var user = await User.findOne({ email: email });
      if (user) {
        return res.status(400).json({
          errors: [
            {
              value: email,
              msg: "An account with this email address already exists",
              param: "email"
            }
          ]
        });
      } else {
        const newUser = new User({ name, email, password });
        user = await newUser.save();

        //On successful save, create payload and send response token with user
        user.login(user, (err, token) => {
          if (err) throw err;
          res.status(201).json({
            success: true,
            token: "Bearer " + token,
            user: user
          });
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
);

router.post(
  "/login",
  [
    check("email", "Enter your account email address to login")
      .not()
      .isEmpty(),
    check("password", "Please enter a password to login")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.length > 0) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    // Find if user exists
    try {
      var user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          errors: [
            {
              value: email,
              msg: "Cannot find a user with this email",
              param: "email"
            }
          ]
        });
      } else {
        // User exists, compare hashed password
        let isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          // Passwords match, create JWT Payload, and send it in response with user object
          user.login(user, (err, token) => {
            if (err) throw err;
            res.status(201).json({
              success: true,
              token: "Bearer " + token,
              user: user
            });
          });
        } else {
          return res.status(400).json({
            errors: [
              {
                msg: "The password you entered did not match our records",
                param: "password"
              }
            ]
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
);

router.get("/user/:id", isAuth, async (req, res) => {
  const _id = req.params.id;
  // Find if user exists
  try {
    var user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        errors: [
          {
            value: _id,
            msg: "Cannot find the user",
            param: "id"
          }
        ]
      });
    } else {
      user.password = undefined;
      res.status(201).json({
        user
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/user/profile/:id", isAuth, async (req, res) => {
  const _id = req.params.id;
  // Find if user exists

  try {
    var user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        errors: [
          {
            value: _id,
            msg: "Cannot find the user",
            param: "id"
          }
        ]
      });
    } else {
      user.password = undefined;
      user.credits = undefined;
      res.status(201).json({
        user
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.put("/user/:id/edit", isAuth, async (req, res) => {
  try {
    const updatedUser = await editName(req.params.id, req.body);
    res.status(200).send(updatedUser);
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.get("/user/:id/activity", isAuth, async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const userActivity = await getUserActivity(id);
  res.status(200).send(userActivity);
});

router.put("/user/:id/experience", isAuth, async (req, res) => {
  const languages = { ...req.body };
  try {
    await setExperience(req.params.id, languages);
    return res
      .status(200)
      .send({ message: "Successfully updated experience!" });
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
});

router.post("/user/:id/avatar", isAuth, upload.any(), async (req, res) => {
  const url = await uploadAvatar(
    req.params.id,
    req.files[0].buffer,
    req.body.type
  );
  if (url) {
    return res.status(200).send({ message: "received", url: url });
  } else return res.status(500);
});

router.post("/user/:id/purchase-credit", isAuth, async (req, res) => {
  const { credits } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: credits * 500,
      currency: "usd"
    });
    res.status(200).send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
  }
});

router.put("/user/:id/add-credit", isAuth, async (req, res) => {
  try {
    const { credits } = req.body;
    const success = await updateCredits(req.params.id, credits);
    if (success) {
      return res
        .status(200)
        .send({ success: true, message: "Successfully added credits!" });
    } else {
      return res
        .status(403)
        .send({ success: false, error: "Not enough credits" });
    }
  } catch (err) {
    return res.status(400);
  }
});

router.patch("/user/:id/decline-request/:requestId", async (req, res) => {
  const userId = req.params.id;
  const threadId = req.params.requestId;
  try {
    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(threadId)
    ) {
      throw new Error("invalidThreadIdError");
    }
    const user = await unassignThread(userId, threadId);
    const thread = await Thread.findById(threadId);
    matchingQueue.addJob({ thread: thread, pass: 1 }); //begin rematching
    if (user) {
      return res.status(200).json({
        success: true,
        user: user
      });
    } else throw new Error("Failed to unassign thread");
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

//Route used for testing
router.get("/users/all", async (req, res) => {
  const users = await User.find({ assignedThreads: { $exists: true } });
  res.status(200).json({
    users
  });
});

router.patch("/users/rating", async (req, res) => {
  const users = await User.updateMany(
    { _id: { $exists: true } },
    { rating: { averageRating: 3, count: 0 } }
  );
  res.status(200).json({
    users
  });
});

module.exports = router;
