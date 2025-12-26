import mongoose from "mongoose"

import fs from "fs"

function loadPosts() {
  const json = fs.readFileSync("posts.json", "utf8");
  return JSON.parse(json);
}

function savePosts(posts) {
  fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));
}

import express from "express"

const app = express();


app.use(express.json());



// const jwt = require("jsonwebtoken")
import jwt from "jsonwebtoken"
const SECRET = "123456"

app.get("/test-token", async (req, res) => {
  try {
    const data1 = jwt.sign({test: true}, SECRET, {expiresIn: "1h"})
    res.json({
      data: data1
    })
  } catch(err) {
    res.status(500).json({ error: "エラー", details: err})
  }
})


const authMiddleware = (req, res, next) => {
  try {
    const auth = req.headers.authorization
    if(!auth) {
      return res.status(401).json({ error: "トークンが見つかりません"})
    }
    const token = auth.split(" ")

    if(token.length !== 2 || token[0] !== "Bearer") {
      return res.status(401).json({ error: "認証ヘッダーの形式が不正です"})
    }
    const tokens = token[1]
    const decoded = jwt.verify(tokens, SECRET)
    req.user = decoded
    next()
  } catch(err) {
    res.status(401).json({ error: "トークンが不正です"})
  }
}

app.get("/mypage", authMiddleware, (req, res) => {
  try {
    res.json({
      message: "mypage へようこそ",
      user: {
        userId: req.user.userId,
        email: req.user.email
      }
    })
  } catch(err) {
    res.status(401).json({ error: "エラー発生", details: err})
  }
})





const adminMiddleware = (req, res, next) => {
  try {
    if(req.user.role !== "admin") {
      return res.status(403).json({ error: "管理者権限が必要です"})
    }
    return next()
  } catch(err) {
    res.status(403).json({ error: "不正です", details: err})
  }
}

app.get("/admin/test", authMiddleware, adminMiddleware, (req, res) => {
  try {
    res.json({
      message: "管理者専用ページです",
      data: req.user
    })
  } catch(err) {
    res.status(403).json({ error: "管理者限定です", details: err})
  }
})

app.post("/admin/bond", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { 
      name,
      couponRate,
      maturityDate,
      issuer,
      faceValue,
      issueDate,
      paymentFrequency,
      value,
      location
    } = req.body
    const required = [
      name, couponRate, maturityDate, issuer, faceValue,
      issueDate, paymentFrequency, value, location
    ]
    if(required.some(v => !v)) {
      return res.status(422).json({ error: "必要な項目がありません"})
    }
    const newBond = new Asset({
      name,
      category: "bond",
      value,
      location,
      bond: {
        couponRate,
        maturityDate: new Date(maturityDate),
        issuer,
        faceValue,
        issueDate: new Date(issueDate),
        paymentFrequency
      },
      ownerId: req.user.userId
    })
    await newBond.save()
    res.json({
      message: "Bond を登録しました（admin専用）",
      data: newBond
    })
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Bond 登録エラー", details: err})
  }
})


app.get("/admin/bond", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bonds = await Asset.find({category: "bond"})
    res.json({
      message: "Bond 一覧 （admin専用）",
      data: bonds
    })
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Bond 一覧取得エラー", details: err})
  }
})


app.get("/admin/bond/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = req.params.id
    const bond = await Asset.findOne({ _id: id, category: "bond"})
    if(!bond) {
      return res.status(404).json({ error: "Bond が見つかりません"})
    }
    res.json({
      message: "Bond 詳細 （admin専用）",
      data: bond
    })
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Bond 詳細取得エラー"})
  }
})

app.put("/admin/bond/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = req.params.id
    const { name, value } = req.body
    const bond = await Asset.findOne({ _id: id, category: "bond"})
    if(!bond) {
      return res.status(404).json({ error: "Bond が見つかりません"})
    }
    if(name !== undefined) bond.name = name
    if(value !== undefined) bond.value = value
    await bond.save()
    res.json({
      message: "Bond詳細を更新しました",
      data: bond
    })
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "更新エラー", details: err})
  }
})

app.delete("/admin/bond/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = req.params.id
    const bond = await Asset.findOne({ _id: id, category: "bond"})
    if(!bond) {
      return res.status(400).json({ error: "Bond が見つかりません"})
    }
    await bond.deleteOne()
    res.json({
      message: "削除できました",
      data: bond
    })
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "削除できませんでした", details: err})
  }
})



app.post("/user/bond", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      value,
      location,
      couponRate,
      maturityDate,
      issuer,
      faceValue,
      issueDate,
      paymentFrequency
    } = req.body
    const all = [
      name,
      description,
      value,
      location,
      couponRate,
      maturityDate,
      issuer,
      faceValue,
      issueDate,
      paymentFrequency
    ]
    if(all.some(v => !v)) {
      return res.status(404).json({ error: "必要な項目を満たしていません"})
    }

    const newBond = new Asset({
      name,
      description,
      value,
      category: "bond",
      location,
      bond: {
        couponRate,
        maturityDate: new Date(maturityDate),
        issuer,
        faceValue,
        issueDate: new Date(issueDate),
        paymentFrequency
      },
      ownerId: req.user.userId
    })

    await newBond.save()

    res.json({
      message: "Bond登録完了",
      data: newBond
    })
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Bond取得エラー", details: err})
  }
})

app.get("/user/bond", authMiddleware, async (req, res) => {
  try {
    const bonds = await Asset.find({ ownerId: req.user.userId, category: "bond"})
    res.json({
      message: "Bond一覧",
      data: bonds
    })
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Bond一覧取得失敗", details: err})
  }
})

app.get("/user/bond/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id
    const bd = await Asset.findOne({ _id: id, ownerId: req.user.userId, category: "bond"})
    if(!bd) {
      return res.status(404).json({ error: "Bond詳細が見つかりません"})
    }
    res.json({
      message: "Bond詳細",
      data: bd
    })
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Bond詳細取得できませんでした", details: err})
  }
})

app.put("/user/bond/:id", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      value
    } = req.body
    const id = req.params.id
    const bonds = await Asset.findOne({ _id: id, ownerId: req.user.userId, category: "bond"})

    if(!bonds) {
      return res.status(404).json({ error: "Bond が見つかりません"})
    }

    if(name !== undefined) bonds.name = name
    if(value !== undefined) bonds.value = value

    await bonds.save()
    res.json({
      message: "Bondを更新しました",
      data: bonds
    })
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "更新エラー", details: err})
  }
})

app.delete("/user/bond/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id

    const bonds = await Asset.findOne({ _id: id, ownerId: req.user.userId, category: "bond"})
    if(!bonds) {
      return res.status(404).json({ error: "Bondが見つかりません"})
    }
    await bonds.deleteOne()
    res.json({
      message: "削除完了",
      data: bonds
    })
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "削除できませんでした", details: err})
  }
})






app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "メールかパスワードが違います" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "メールかパスワードが違います" });

    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, SECRET, {expiresIn: "7d"}
    );
    res.json({
      message: "ログイン成功！",
      token: token,
    });
  } catch (err) {
    res.status(500).json({ error: "ログインエラー", details: err });
  }
});






















mongoose
  .connect(
    "mongodb+srv://admin1709_db_user:v3F6rV45wfzl2zTM1702@admin.cw7ga6b.mongodb.net/testDB?appName=admin"
  )
  .then(() => {
    console.log("MongoDB 接続成功！");
  })
  .catch((err) => {
    console.error("MongeDB 接続エラー：", err);
  });

const postSchema = new mongoose.Schema({
  title: String,
});
const Post = mongoose.model("Post", postSchema);

app.listen(3000, (req, res) => {
  console.log("http://localhost:3000 でサーバー起動中");
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user"}
});

const User = mongoose.model("User", userSchema);



// const bcrypt = require("bcrypt");
import bcrypt from "bcrypt"

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashed,
    });
    await newUser.save();
    res.json({ message: "ユーザー登録完了！" });
  } catch (err) {
    res.status(500).json({ error: "登録エラー", details: err });
  }
});




const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: "bond" },
  description: String,
  value: { type: String, required: true },
  location: String,

  bond: {
    couponRate: {
      type: Number,
      required: true
    },
    maturityDate: {
      type: Date,
      required: true
    },
    issuer: {
      type: String,
      required: true
    },
    faceValue: {
      type: Number,
      required: true
    },
    issueDate: {
      type: Date,
      required: true
    },
    paymentFrequency: {
      type: String, enum: ["annual", "semiannual", "quarterly"],
      required: true
    },
    rating: {
      type: String,
      default: null
    },
    currency: {
      type: String,
      enum: ["USD", "JPY", "EUR"]
    },
    totalSupply: {
      type: Number,
      required: true
    },
    couponType: {
      type: String,
      enum: ["fixed", "floating"]
    },
    bondType: {
      type: String,
      enum: ["government", "corporate", "structured"],
      default: "government"
    },

    tokenIds: {
    senior: { type: Number, required: true },
    junior: { type: Number, required: true }
  }},


  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Asset = mongoose.model("Asset", assetSchema);



const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Asset",
  },

  tranche: {
    type: String,
    enum: ["senior", "junior"],
    required: true
  },

  tokenId: {
    type: Number,
    required: true,
    index: true
  },

  amount: {
    type: Number,
    required: true,
    min: 0
  },
  faceValue: {
    type: "Number",
    required: true,
  },
  coupon: {
    type: "Number",
    required: true,
  },
  years: {
    type: "Number",
    required: true,
  },
  ytm: {
    type: "Number",
  },
  cleanPrice: {
    type: "Number",
  },
  dirtyPrice: {
    type: "Number",
  },
  accruedInterest: {
    type: "Number",
  },
  nextCouponDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

investmentSchema.index(
  { userId: 1, assetId: 1, tranche: 1 },
  { unique: true }
)
const Investment = mongoose.model("Investment", investmentSchema)


const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Asset"
  },
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Investment"
  },
  type: {
    type: String,
    enum: ["BUY", "SELL", "COUPON"],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  tokenId: {
    type: Number,
    required: true
  },
  tranche: {
    type: String,
    enum: ["senior", "junior"],
    required: true
  }
})

const Transaction = mongoose.model("Transaction", transactionSchema)



app.post("/invest", authMiddleware, async (req, res) => {
  try {
    const { assetId, amount, tranche = "senior" } = req.body
    if(!assetId || !amount) {
      return res.status(400).json({ error: "assetId と amount は必須です"})
    }
    if(amount <= 0) {
      return res.status(400).json({ error: "投資金額が不正です"})
    }
    const assetBd = await Asset.findOne({ _id: assetId, category: "bond"})
    if(!assetBd) {
      return res.status(400).json({ error: "Bond 資産が見つかりません"})
    }

    if(!["senior", "junior"].includes(tranche)) {
      return res.status(400).json({ error: "tranche は senior / junior のみ指定可能です"})
    }

    const tokenId = assetBd.bond.tokenIds?.[tranche]
    if(!tokenId) {
      return res.status(400).json({ error: "tokenId が Asset に設定されていません"})
    }



    const faceValue = assetBd.bond.faceValue
    const couponRate = assetBd.bond.couponRate / 100
    const coupon = faceValue * couponRate

    const years = 
    (new Date(assetBd.bond.maturityDate) - new Date(assetBd.bond.issueDate)) / 
    (1000 * 60 * 60 * 24 * 365)

    const paymentFrequency = assetBd.bond.paymentFrequency
    const settlementDate = new Date()

    const accruedInterest = calculateAccruedInterest(
      assetBd.bond.issueDate,
      paymentFrequency,
      coupon,
      settlementDate
    )

    const dirtyPrice = amount
    const cleanPrice = dirtyPrice - accruedInterest

    const ytm = calculateYTM(dirtyPrice, faceValue, coupon, years, paymentFrequency)
    
    const freqMap = {
      annual: 12,      // 年1回
      semiannual: 6,   // 年2回
      quarterly: 3,    // 年4回
      monthly: 1
    };

    const months = freqMap[paymentFrequency] || 12;

    // ④ 次のクーポン日を計算
    let nextCouponDate = new Date(assetBd.bond.issueDate);

    while (nextCouponDate <= settlementDate) {
      nextCouponDate.setMonth(nextCouponDate.getMonth() + months);
    }

    const newInvestment = new Investment({
      userId: req.user.userId,
      assetId,

      tranche,
      tokenId,
      
      amount: dirtyPrice,
      faceValue,
      coupon,
      years,
      paymentFrequency,
      cleanPrice,
      dirtyPrice,
      accruedInterest,
      ytm,
      nextCouponDate
    })

    await newInvestment.save()

    await Transaction.create({
      userId: req.user.userId,
      assetId,
      investmentId: newInvestment._id,
      type: "BUY",
      amount: dirtyPrice
    })

    res.json({
      message: "投資が完了しました",
      ytm: (ytm * 100).toFixed(3) + "%",
      cleanPrice: cleanPrice.toFixed(3),
      accruedInterest: accruedInterest.toFixed(3),
      dirtyPrice: dirtyPrice.toFixed(3),
      data: newInvestment
    })

  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "投資処理中にエラー", details: err})
  }
})

app.get("/my-investment", authMiddleware, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.userId })
    .populate("assetId")

    const today = new Date()

    const enriched = investments.map((inv) => {
      const bond = inv.assetId

      if(!bond || bond.category !== "bond" || !bond.bond) {
        return {
          investmentId: inv._id,
          amount: inv.amount,
          nextCouponDate: inv.nextCouponDate,
          percentage: 0,
          duration: null,
          convexity: null,
          bond: null,
        }
      }

      const totalValue = Number(bond.value)
      const percentage = totalValue > 0 ? (inv.amount / totalValue) * 100 : 0
      
      const couponRate = bond.bond.couponRate || 0
      const paymentFrequency = bond.bond.paymentFrequency || "annual"
      const maturityDate = new Date(bond.bond.maturityDate)

      const yearsRemaining = 
      (maturityDate - today) / (1000 * 60 * 60 * 24 * 365)

      let durationInfo = null
      let convexityInfo = null

      if(inv.ytm && yearsRemaining > 0 && couponRate > 0) {
        const faceForRisk = inv.amount
        const couponAnnual = faceForRisk * (couponRate / 100)

        const { macaulayDuration, modifiedDuration } = calculateDuration(
          faceForRisk,
          couponAnnual,
          yearsRemaining,
          inv.ytm,
          paymentFrequency
        )

        durationInfo = {
          macaulay: macaulayDuration
            ? Number(macaulayDuration.toFixed(3))
            : null,
          modified: modifiedDuration
            ? Number(modifiedDuration.toFixed(3))
            : null,
        }

        const { convexity, modifiedConvexity } = calculateConvexity(
          faceForRisk,
          couponAnnual,
          yearsRemaining,
          inv.ytm,
          paymentFrequency
        )

        convexityInfo = {
          macaulay: convexity ? Number(convexity.toFixed(3)) : null,
          modified: modifiedConvexity
            ? Number(modifiedConvexity.toFixed(3))
            : null
        }
      }

      return {
        investmentId: inv._id,
        amount: inv.amount,
        nextCouponDate: inv.nextCouponDate,
        percentage,
        duration: durationInfo,
        convexity: convexityInfo,

        bond: {
          id: bond._id,
          name: bond.name,
          category: bond.category,
          value: bond.value,
          couponRate: bond.bond?.couponRate,
          paymentFrequency: bond.bond?.paymentFrequency,
          maturityDate: bond.bond?.maturityDate,
        }
      }
    })
    
    res.json({
      message: "投資一覧（保有割合 + Duration + Convexityつき）",
      data: enriched
    })
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "投資一覧取得失敗", details: err})
  }
})

app.get("/my-coupons", authMiddleware, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.userId })
    .populate("assetId")

    const coupons = investments
    .filter((inv) => inv.assetId?.category === "bond")
    .map((inv) => {
      const asset = inv.assetId
      const amount = inv.amount
      const couponRate = asset.bond?.couponRate
      const freq = asset.bond?.paymentFrequency
      const nextCouponDate = inv.nextCouponDate

      const freqMap = {
        annual: 1,
        semiannual: 2,
        quarterly: 4,
      }

      const paymentsPerYear = freqMap[freq] || 1

      const couponAmount = (amount * (couponRate / 100)) / paymentsPerYear

      return {
        bondName: asset.name,
        amount,
        couponRate,
        paymentFrequency: freq,
        couponAmount: Number(couponAmount.toFixed(2)),
        nextCouponDate,
      }
    })

    res.json({
      message: "クーポン情報一覧",
      data: coupons
    })
    } catch(err) {
      console.log(err)
      res.status(500).json({ error: "クーポン情報取得エラー", details: err})
    }
  })

  app.post("/invest/sell", authMiddleware, async (req, res) => {
    try {
      const { investmentId, sellAmount } = req.body
      if(!investmentId || !sellAmount) {
        return res.status(400).json({ error: "investmentId と sellAmount は必須です"})
      }

      if(sellAmount <= 0) {
        return res.status(400).json({ error: "投資金額が不正です"})
      }
      const investment = await Investment.findById(investmentId)
      .populate("assetId")

      if(investment.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: "この投資を売却する権限がありません"})
      }

      if(sellAmount > investment.amount) {
        return res.status(400).json({ error: "売却額が保有額を超えています"})
      }

      let isFullySold = false

      if(sellAmount === investment.amount) {
        await Investment.deleteOne({ _id: investment._id})
        isFullySold = true
      } else {
        investment.amount -= sellAmount
        await investment.save()
      }

      await Transaction.create({
        userId: req.user.userId,
        assetId: investment.assetId,
        investmentId: investment._id,
        type: "SELL",
        amount: sellAmount
      })

      res.json({
        message: isFullySold ? "全額売却しました" : "部分売却が完了しました",
        soldAmount: sellAmount,
        remainingAmount: isFullySold ? 0 : investment.amount
      })

    } catch(err) {
      console.log(err)
      res.status(500).json({ error: "売却処理中にエラー", details: err})
    }
  })



  app.post("/coupon/claim", authMiddleware, async (req, res) => {
    try {
      const { investmentId } = req.body
      if(!investmentId) {
        return res.status(400).json({ error: "investmentIdは必須です"})
      }
      const investment = await Investment.findById(investmentId)
      .populate("assetId")

      if(!investment) {
        return res.status(404).json({ error: "資産が見つかりません"})
      }
      if(investment.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: "この投資の利息を受け取る権限がありません"})
      }
      const assetBd = investment.assetId

      if(!assetBd || assetBd.category !== "bond") {
        return res.status(400).json({ error: "Bond 資産ではありません"})
      }
      const couponRate = assetBd.bond.couponRate
      const faceValue = assetBd.bond.faceValue
      const paymentFrequency = assetBd.bond.paymentFrequency

      const shockInfo = await getShockMetrics(investment)

      const baseYTM = investment.ytm
      const duration = shockInfo.modifiedDuration
      const lambda  = Math.abs(shockInfo.changePercent)
      const convexity = shockInfo.modifiedConvexity

      const seniorSupplyAgg = await Investment.aggregate([
        { $match: { assetId: assetBd._id, tranche: "senior"}},
        { $group: { _id: null, total: { $sum: "$amount"}}}
      ])

      const seniorSupply = seniorSupplyAgg[0]?.total || 0

      const juniorSupplyAgg = await Investment.aggregate([
        { $match: { assetId: assetBd._id, tranche: "junior"}},
        { $group: { _id: null, total: {$sum: "$amount"}}}
      ])

      const juniorSupply = juniorSupplyAgg[0]?.total || 0



      const freqMap = {
        annual: 1,
        semiannual: 2,
        quarterly: 4,
      }
      
      const paymentsPerYear = freqMap[paymentFrequency] || 1

      const annualCoupon = faceValue * (couponRate / 100)
      const perPaymentBondCashflow = annualCoupon / paymentsPerYear

      const k = 0.1
      const convexityAdj = convexity * 0.0001

      const seniorRate = 
        baseYTM - (duration * (lambda / 100) * k) + convexityAdj

      const seniorPayoutPerToken = (seniorRate * faceValue) / paymentsPerYear

      const totalSenior = seniorPayoutPerToken * seniorSupply

      const remaining = Math.max(0, perPaymentBondCashflow - totalSenior)
      const juniorPayoutPerToken = 
        juniorSupply > 0 ? remaining / juniorSupply : 0

      let payout = 0
      const userSupply = investment.amount
      if (investment.tranche === "senior") {
        payout = seniorPayoutPerToken * (userSupply / seniorSupply)
      } else {
        payout = juniorPayoutPerToken * (userSupply / juniorSupply)
      }

      const monthsMap = {
        annual: 12,
        semiannual: 6,
        quarterly: 3,
      }

      const months = monthsMap[paymentFrequency]
      investment.nextCouponDate.setMonth(investment.nextCouponDate.getMonth() + months)
      await investment.save()

      await Transaction.create({
        userId: investment.userId,
        assetId: investment.assetId,
        investmentId: investment._id,
        type: "COUPON",
        amount: payout
      })

      res.json({
        message: "クーポン受け取り（Senior/Junior版）完了",
        tranche: investment.tranche,
        payout: Number(payout.toFixed(4)),
        detail: {
          seniorRate: Number(seniorRate.toFixed(4)),
          duration,
          lambda,
          convexity
        },
        nextCouponDate: investment.nextCouponDate
      })
    } catch(err) {
      console.log(err)
      res.status(500).json({ error: "クーポン処理中でエラー", details: err})
    }
    })



  app.get("/asset/:id", authMiddleware, async (req, res) => {
    try {
      const assetId = req.params.id
      const asset = await Asset.findById(assetId)

      if(!asset) {
        return res.status(404).json({ error: "資産が見つかりません"})
      }

      const investment = await Investment.findOne({
        userId: req.user.userId,
        assetId: assetId
      })

      const userAmount = investment ? investment.amount : 0
      const nextCouponDate = investment ? investment.nextCouponDate : null
      
      const couponRate = asset.bond.couponRate
      const freq = asset.bond.paymentFrequency

      const freqMap = {
        annual: 1,
        semiannual: 2,
        quarterly: 4
      }

      const paymentsPerYear = freqMap[freq] || 1



      const couponAmount = userAmount
      ? Number(((userAmount * (couponRate / 100)) / paymentsPerYear).toFixed(2)) : 0

      res.json({
        message: "Asset詳細",
        data: {
          id: asset._id,
          name: asset.name,
          category: asset.category,
          issuer: asset.bond.issuer,
          rating: asset.bond.rating,
          currency: asset.bond.currency,
          bondType: asset.bond.bondType,
          couponType: asset.bond.couponType,
          couponRate: asset.bond.couponRate,
          paymentFrequency: asset.bond.paymentFrequency,
          issueDate: asset.bond.issueDate,
          maturityDate: asset.bond.maturityDate,
          totalSupply: asset.bond.totalSupply,

          userInvestment: {
            userAmount,
            nextCouponDate,
            expectedCoupon: couponAmount
          }
        }
      })
    } catch(err) {
      console.log(err)
      res.status(500).json({ error: "資産詳細取得エラー", details: err})
    }
  })




  function calculateBondPrice(yieldRate, faceValue, coupon, years, paymentFrequency) {
    const freqMap = {
      annual: 1,
      semiannual: 2,
      quarterly: 4,
      monthly: 12
    }

    const perYear = freqMap[paymentFrequency] || 1
    const periodRate = yieldRate / perYear
    const totalPeriods = years * perYear
    const couponPerPeriod = coupon / perYear


    let price = 0
    for(let t = 1; t <= totalPeriods; t++) {
      price += couponPerPeriod / Math.pow(1 + periodRate, t)
    }
    price += faceValue / Math.pow(1 + periodRate, totalPeriods)
    return price
  }

  
  
  function calculateYTM(price, faceValue, coupon, years, paymentFrequency) {
    let low = 0
    let high = 1
    let mid

    for(let i = 0; i < 120; i++) {
      mid = (low + high) / 2
      const estimatedPrice = calculateBondPrice(
        mid,
        faceValue,
        coupon,
        years,
        paymentFrequency
      )
      if(estimatedPrice > price) {
        low = mid
      } else {
        high = mid
      }
    }
    return (low + high) / 2
  }
  

  function calculateAccruedInterest(issueDate, paymentFrequency, coupon, settlementDate) {
    const freqMap = {
      annual: 1,
      semiannual: 2,
      quarterly: 4,
      monthly: 12,
    }

    const periods = freqMap[paymentFrequency] || 1
    const couponPerPayment = coupon / periods

    const daysInPeriod = 365 / periods

    const lastCoupon = new Date(issueDate)
    const nextCoupon = new Date(issueDate)

    while (nextCoupon <= settlementDate) {
      lastCoupon.setTime(nextCoupon.getTime())
      nextCoupon.setMonth(nextCoupon.getMonth() + (12 / periods))
    }

    const daysSinceLastCoupon = 
      (settlementDate - lastCoupon) / (1000 * 60 * 60 * 24)

    const accruedInterest = couponPerPayment * (daysSinceLastCoupon / daysInPeriod)
    return accruedInterest
  }



  function calculateDuration(faceValue, couponAnnual, years, ytm, paymentFrequency) {
    const freqMap = {
      annual: 1,
      semiannual: 2,
      quarterly: 4,
      monthly: 12,
    }

    const m = freqMap[paymentFrequency] || 1
    const periodRate = ytm / m
    const totalPeriods = Math.round(years * m)
    const couponPerPeriod = couponAnnual / m

    let price = 0
    for (let k = 1; k <= totalPeriods; k++) {
      price += couponPerPeriod / Math.pow(1 + periodRate, k)
    }
    price += faceValue / Math.pow(1 + periodRate, totalPeriods)

    if(price === 0 || !isFinite(price)) {
      return {
        macaulayDuration: null,
        modifiedDuration: null,
        price: null
      }
    }

    let weightedSum = 0

    for(let k = 1; k <= totalPeriods; k++) {
      const isLast = k === totalPeriods

      const cf = isLast ? couponPerPeriod + faceValue : couponPerPeriod

      const pv = cf / Math.pow(1 + periodRate, k)
      const weight = pv / price

      const tYears = k / m

      weightedSum += tYears * weight
    }

    const macaulayDuration = weightedSum
    const modifiedDuration = macaulayDuration / (1 + ytm / m)

    return {
      macaulayDuration,
      modifiedDuration,
      price,
    }
  }



  function calculateConvexity(faceValue, couponAnnual, years, ytm, paymentFrequency) {
  const freqMap = {
    annual: 1,
    semiannual: 2,
    quarterly: 4,
    monthly: 12,
  };

  const m = freqMap[paymentFrequency] || 1; // 年間支払回数
  const periodRate = ytm / m;               // 1期間あたりの利回り
  const totalPeriods = Math.round(years * m);
  const couponPerPeriod = couponAnnual / m;

  // ① まず現在の clean price（理論価格）を計算
  let price = 0;
  for (let k = 1; k <= totalPeriods; k++) {
    price += couponPerPeriod / Math.pow(1 + periodRate, k);
  }
  price += faceValue / Math.pow(1 + periodRate, totalPeriods);

  if (price === 0 || !isFinite(price)) {
    return {
      convexity: null,
      modifiedConvexity: null,
      price: null,
    };
  }

  // ② Convexity の和を計算
  //   Macaulay Convexity（年単位）を periodsベースの式から求める
  let convexitySum = 0;

  for (let k = 1; k <= totalPeriods; k++) {
    const isLast = (k === totalPeriods);
    const cf = isLast ? couponPerPeriod + faceValue : couponPerPeriod;

    // t = k（期数）のまま式を組み立て、後で年ベースに変換
    // 一般式: Σ CF_t * t * (t + 1) / (1 + r)^(t + 2)
    convexitySum += cf * k * (k + 1) / Math.pow(1 + periodRate, k + 2);
  }

  // 期数ベースから「年単位」の Convexity に変換（m^2 で割る）
  const macaulayConvexity = convexitySum / (price * m * m);

  // Modified Convexity（価格変化に直接使う用）
  const modifiedConvexity = macaulayConvexity / Math.pow(1 + ytm / m, 2);

  return {
    convexity: macaulayConvexity,       // 年^2 単位のコンベクシティ
    modifiedConvexity,                  // 価格変動近似で使う用
    price,
  };
}


function generateBondTokenIds(bondObjectId, version = 1) {
  const bondHek = bondObjectId.toString().slice(-6)
  const bondNumericId = parseInt(bondHek, 16)

  const senior = bondNumericId * 1000 + 1 * 10 + version
  const junior = bondNumericId * 1000 + 2 * 10 + version

  return { senior, junior }
}


app.post("/bond-assets", authMiddleware, async (req, res) => {
  try {
    const { name, description, value, location, bond } = req.body;
    if (!name || !value || !bond) {
      return res.status(400).json({ error: "name, value, bond は必須です" });
    }
    const requiredBondFields = [
      "couponRate",
      "maturityDate",
      "issuer",
      "faceValue",
      "issueDate",
      "paymentFrequency",
      "totalSupply",
    ];
    for (const field of requiredBondFields) {
      if (!bond[field]) {
        return res.status(400).json({ error: `bond.${field}は必須です` });
      }
    }
    const newBondAsset = new Asset({
      name,
      category: "bond",
      description,
      value,
      location,
      bond: {
        couponRate: bond.couponRate,
        maturityDate: new Date(bond.maturityDate),
        issuer: bond.issuer,
        faceValue: bond.faceValue,
        issueDate: new Date(bond.issueDate),
        paymentFrequency: bond.paymentFrequency,
        totalSupply: bond.totalSupply
      },
      ownerId: req.user.userId,
    });


    const tokenIds = generateBondTokenIds(newBondAsset._id, 1)

    newBondAsset.bond.tokenIds = tokenIds
    await newBondAsset.save()
    res.json({
      message: "Bond 資産を登録しました",
      data: {
        id: newBondAsset._id,
        name: newBondAsset.name,
        tokenIds,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Bond 資産登録中にエラー", details: err });
  }
});



app.get("/investment/:id/price-scenario", authMiddleware, async (req, res) => {
  try {
    const investmentId = req.params.id

    const shockParam = req.query.shock 
    const dy = shockParam !== undefined ? Number(shockParam) : 0.01

    if(!investmentId) {
      return res.status(400).json({ error: "investmentId は必須です"})
    }

    if(!Number.isFinite(dy)) {
      return res.status(400).json({ error: "shock は数値で指定してください（例: 0.01）"})
    }

    const inv = await Investment.findOne({
      _id: investmentId,
      userId: req.user.userId
    }).populate("assetId")

    if(!inv) {
      return res.status(404).json({ error: "投資が見つかりません"})
    }

    const bondBd = inv.assetId

    if(!bondBd || bondBd.category !== "bond" || !bondBd.bond) {
      return res.status(400).json({ error: "この投資は債券ではないため、金利ショック計算はできません"})
    }

    const today = new Date()

    const couponRate = bondBd.bond.couponRate || 0
    const paymentFrequency = bondBd.bond.paymentFrequency || "annual"
    const maturityDate = new Date(bondBd.bond.maturityDate)

    const yearsRemaining =
      (maturityDate - today) / (1000 * 60 * 60 * 24 * 365)

    if(!inv.ytm || yearsRemaining <= 0 || couponRate <= 0) {
      return res.status(400).json({ error: "この投資については YTM または残存年数やクーポン情報が不足しているため、金利ショック計算ができません"})
    }

    const ytm = inv.ytm
    
    const faceForRisk = inv.amount
    const couponAnnual = faceForRisk * (couponRate / 100)

    const basePrice = calculateBondPrice(
      ytm,
      faceForRisk,
      couponAnnual,
      yearsRemaining,
      paymentFrequency,
    )

    const { modifiedDuration } = calculateDuration(
      faceForRisk,
      couponAnnual,
      yearsRemaining,
      ytm,
      paymentFrequency
    )

    const { modifiedConvexity } = calculateConvexity(
      faceForRisk,
      couponAnnual,
      yearsRemaining,
      ytm,
      paymentFrequency
    )

    if(
      !Number.isFinite(basePrice) ||
      !Number.isFinite(modifiedDuration) ||
      !Number.isFinite(modifiedConvexity)
    ) {
      return res.status(500).json({ error: "リスク指標の計算に失敗しました"})
    }

    const changeFraction =
    (-modifiedDuration * dy) + (0.5 * modifiedConvexity * dy * dy)

    const shockedPrice = basePrice * (1 + changeFraction)

    res.json({
      message: "金利ショックシナリオ",
      params: {
        investmentId: inv._id,
        shock: dy,
      },
      base: {
        price: Number(basePrice.toFixed(4)),
        ytm: Number(ytm.toFixed(6))
      },
      risk: {
        modifiedDuration: Number(modifiedDuration.toFixed(4)),
        modifiedConvexity: Number(modifiedConvexity.toFixed(4))
      },
      scenario: {
        shockedPrice: Number(shockedPrice.toFixed(4)),
        changeFraction: Number(changeFraction.toFixed(6)),
        changePercent: Number((changeFraction * 100).toFixed(3))
      }
    })
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "金利ショック中にエラー", details: err})
  }
})


const RISK_RULES = {
  baseRate: 10.0,
  targetDuration: 1.5,
  penaltyFactor: 2.0,
  discountFactor: 0.5
}

// 2. 計算ロジック（Helper関数）

/**
 * ノンバンクから提出されたローン一覧から、ポートフォリオ全体のDurationを計算
 * @param {Array} loans - { amount: Number, monthsToMaturity: Number } の配列
 */

function calculatePortfolioDuration(loans) {
  let totalWeightedTime = 0
  let totalAmount = 0

  for (const loan of loans) {
    totalWeightedTime += Number(loan.amount) * Number(loan.monthsToMaturity)
    totalAmount += Number(loan.amount)
  }

  if(totalAmount === 0) return 0

  const averageMonths = totalWeightedTime / totalAmount
  return averageMonths / 12
}

function determineDynamicRate(currentDuration) {
  let newRate = RISK_RULES.baseRate
  let message = ""

  if(currentDuration > RISK_RULES.targetDuration) {
    const diff = currentDuration - RISK_RULES.targetDuration
    const penalty = diff * RISK_RULES.penaltyFactor
    newRate += penalty
    message = `⚠️ リスク超過 (+${penalty.toFixed(2)}%)`
  } else {
    const diff = RISK_RULES.targetDuration - currentDuration
    const discount = diff * RISK_RULES.discountFactor
    newRate -= discount
    message = `✅ 優良経営 (-${discount.toFixed(2)}%)`
  }

  return {
    rate: Math.max(0.1, newRate),
    message
  }
}


app.post("/asset/:id/update-dynamic-rate", authMiddleware, async (req, res) => {
  try {
    const assetId = req.params.id
    const { portfolioData } = req.body

    if(!portfolioData || !Array.isArray(portfolioData) || portfolioData.length === 0) {
      return res.status(400).json({ error: "有効な portfolioData (配列) が必要です"})
    }

    const asset = await Asset.findById(assetId)

    if(!asset) {
      return res.status(404).json({ error: "資産が見つかりません"})
    }

    if(asset.category !== "bond") {
      return res.status(400).json({ error: "Bond資産ではありません"})
    }
    if(asset.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "この資産の金利を更新する権限がありません"})
    }

    const durationYears = calculatePortfolioDuration(portfolioData)

    const { rate: newRate, message } = determineDynamicRate(durationYears)

    const oldRate = asset.bond.couponRate
    asset.bond.couponRate = Number(newRate.toFixed(2))

    await asset.save()

    res.json({
      message: "ダイナミック・インタレスト適用完了",
      details: {
        portfolioCount: portfolioData.length,
        calculatedDuration: `${durationYears.toFixed(2)} 年`,
        status: message,
        rateUpdate: {
          before: `${oldRate}%`,
          after: `${asset.bond.couponRate}%`
        }
      }
    })
  } catch(err) {
    console.error(err)
    res.status(500).json({ error: "金利更新処理中にエラー", details: err.message, stack: err.stack})
  }
})


















































// const { threadCpuUsage } = require("process");
import { threadCpuUsage } from "process";
// const SECRET = "超重要な秘密にキー";

// app.post("/auth/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(401).json({ error: "メールかパスワードが違います" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(401).json({ error: "メールかパスワードが違います" });

//     const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, SECRET, {expiresIn: "7d"}
//     );
//     res.json({
//       message: "ログイン成功！",
//       token: token,
//     });
//   } catch (err) {
//     res.status(500).json({ error: "ログインエラー", details: err });
//   }
// });

// const authMiddleware = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       return res.status(401).json({ error: "トークンがありません" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, SECRET);
//     req.user = decoded;

//     next();
//   } catch (err) {
//     return res.status(401).json({ error: "トークンが不正です", details: err });
//   }
// };

app.post("/assets", authMiddleware, async (req, res) => {
  try {
    const { name, type, value } = req.body;
    if (!name || !type || !value) {
      return res.status(400).json({ error: "name, type, value は必須です" });
    }
    const newAsset = new Asset({
      name,
      type,
      value,
      ownerId: req.user.userId,
    });
    await newAsset.save();
    res.json({
      message: "資産を登録しました！",
      data: newAsset,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "保存中にエラーが発生しました", details: err });
  }
});

app.get("/assets", authMiddleware, async (req, res) => {
  try {
    const assets = await Asset.find({ ownerId: req.user.userId });
    res.json({
      message: "あなたの資産一覧です",
      data: assets,
    });
  } catch (err) {
    res.status(500).json({ error: "取得エラー", details: err });
  }
});

app.get("/assets/:id", authMiddleware, async (req, res) => {
  try {
    const assetId = req.params.id;
    const asset = await Asset.findOne({
      _id: assetId,
      ownerId: req.user.userId,
    });

    if (!asset) {
      return res.status(404).json({ error: "資産が見つかりません" });
    }
    res.json({
      message: "資産の詳細",
      data: asset,
    });
  } catch (err) {
    res.status(500).json({ error: "取得エラー", details: err });
  }
});

app.put("/assets/:id", authMiddleware, async (req, res) => {
  try {
    const assetId = req.params.id;
    const { name, type, value } = req.body;
    const asset = await Asset.findOne({
      _id: assetId,
      ownerId: req.user.userId,
    });

    if (!asset) {
      return res.status(404).json({ error: "資産が見つかりません" });
    }

    if (name !== undefined) asset.name = name;
    if (type !== undefined) asset.type = type;
    if (value !== undefined) asset.value = value;

    await asset.save();

    res.json({
      message: "資産を更新しました",
      data: asset,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "更新中にエラーが発生しました", details: err });
  }
});

app.delete("/assets/:id", authMiddleware, async (req, res) => {
  try {
    const assetId = req.params.id;
    const asset = await Asset.findOne({
      _id: assetId,
      ownerId: req.user.userId,
    });
    if (!asset) {
      return res.status(404).json({ error: "資産が見つかりません" });
    }
    await Asset.deleteOne({ _id: assetId });
    res.json({
      message: "資産を削除しました！",
      data: assetId,
    });
  } catch (err) {
    res.status(500).json({ error: "削除エラー", details: err });
  }
});



// app.post("/bond-assets", authMiddleware, async (req, res) => {
//     try {
//         const {
//             name,
//             description,
//             value,
//             location,
//             bond
//         } = req.body
//         if(!name || !value || !bond) {
//             return res.status(400).json({ error: "name, value, bond は必須です"})
//         }
//         const requiredBondFields = [
//             "couponRate",
//             "maturiryDate",
//             "issuer",
//             "facevalue",
//             "issueDate",
//             "paymentFrequency"
//         ]
//         for(const field of requiredBondFields) {
//             if(!bond[field]) {
//                 return res.status(400).json({ error: `bond${field}は必須です`})
//             }
//         }
//         const newBondAsset = new Asset({
//             name,
//             category: "bond",
//             description,
//             value,
//             location,
//             bond,
//             ownerId: req.user.userId
//         })
//         await newBondAsset.save()
//         res.json({
//             message: "Bond 資産登録しました",
//             data: newBondAsset
//         })
//     } catch(err) {
//         console.log(err)
//         res.status(500).json({ error: "Bond 資産登録中にエラー", details: err})
//     }
// })

// app.post("/bond-assets", authMiddleware, async (req, res) => {
//   try {
//     const { name, description, value, location, bond } = req.body;
//     if (!name || !value || !bond) {
//       return res.status(400).json({ error: "name, value, bond は必須です" });
//     }
//     const requiredBondFields = [
//       "couponRate",
//       "maturityDate",
//       "issuer",
//       "faceValue",
//       "issueDate",
//       "paymentFrequency",
//     ];
//     for (const field of requiredBondFields) {
//       if (!bond[field]) {
//         return res.status(400).json({ error: `bond.${field}は必須です` });
//       }
//     }
//     const newBondAsset = new Asset({
//       name,
//       category: "bond",
//       value,
//       location,
//       bond,
//       ownerId: req.user.userId,
//     });
//     await newBondAsset.save();
//     res.json({
//       message: "Bond 資産を登録しました",
//       data: newBondAsset,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Bond 資産登録中にエラー", details: err });
//   }
// });

app.get("/bond-assets", authMiddleware, async (req, res) => {
  try {
    const bonds = await Asset.find({
      category: "bond",
      ownerId: req.user.userId,
    });
    res.json({
      message: "あなたの Bond 資産一覧",
      data: bonds,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Bond ー取得中にエラー", details: err });
  }
});

app.get("/bond-assets/:id", authMiddleware, async (req, res) => {
  try {
    const bondId = req.params.id;
    const bond = await Asset.findOne({
      _id: bondId,
      category: "bond",
      ownerId: req.user.userId,
    });
    if (!bond) {
      return res.status(404).json({ error: "Bond 資産が見つかりません" });
    }
    res.json({
      message: "Bond 資産の詳細",
      data: {
        ...bond._doc,
        nextCouponAmount: calculateCoupon(bond),
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Bond 詳細取得エラー", details: err });
  }
});


function calculateCoupon(bond, investment = null) {
  const rate = bond.bond.couponRate / 100;
  const faceValue = bond.bond.faceValue;
  const freq = bond.bond.paymentFrequency;

  const frequencyMap = {
    annual: 1,
    semiannual: 2,
    quarterly: 4,
  };
  const divisor = frequencyMap[freq] || 1;

  const annualCoupon = faceValue * rate;

  const couponPerPayment = annualCoupon / divisor;

  if (investment) {
    return couponPerPayment * (investment.percentage / 100);
  }

  return couponPerPayment;
}

app.post("/invests", authMiddleware, async (req, res) => {
  try {
    const { assetId, amount } = req.body;
    if (!assetId || !amount) {
      return res.status(400).json({ error: "assetId と amount は必須です" });
    }
    const bond = await Asset.findOne({
      _id: assetId,
      category: "bond",
    });
    if (!bond) {
      return res.status(404).json({ error: "対象の Bond が見つかりません" });
    }
    const percentage = (amount / bond.value) * 100;
    const newInvestment = new Investment({
      userId: req.user.userId,
      assetId,
      amount,
      percentage,
    });
    await newInvestment.save();
    res.json({
      message: "投資が完了しました",
      data: newInvestment,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "投資処理中にエラー", details: err });
  }
});



app.post("/calculate-coupon", authMiddleware, async (req, res) => {
  try {
    const { assetId, amount } = req.body;
    console.log("受け取った assetId:", assetId);

    const bond1 = await Asset.findOne({ _id: assetId });
    console.log("Bond 単体検索:", bond1);

    const bond2 = await Asset.findOne({ _id: assetId, category: "bond" });
    console.log("Bond カテゴリ検索:", bond2);

    if (!assetId || !amount) {
      return res.status(400).json({ error: "assetId と amount は必須です" });
    }
    const bond = await Asset.findOne({
      _id: assetId,
      category: "bond",
    });
    if (!bond) {
      return res.status(404).json({ error: "Bond 資産が見つかりません" });
    }

    const percentage = (amount / bond.value) * 100;

    // 年間利息（全体）
    const rate = bond.bond.couponRate / 100;
    const faceValue = bond.bond.faceValue;
    const freq = bond.bond.paymentFrequency;

    const frequencyMap = {
      annual: 1,
      semiannual: 2,
      quarterly: 4,
    };

    const divisor = frequencyMap[freq] || 1;
    const annualCoupon = faceValue * rate; // 債券全体の年間利息
    const couponPerPayment = annualCoupon / divisor; // 1回あたり（全体）

    // あなたがもらえる1回分の利息
    const myCouponPerPayment = couponPerPayment * (percentage / 100);

    res.json({
      message: "クーポン（利息）の試算結果",
      bond: {
        id: bond._id,
        name: bond.name,
        couponRate: bond.bond.couponRate,
        paymentFrequency: bond.bond.paymentFrequency,
        faceValue: bond.bond.faceValue,
        totalValue: bond.value,
      },
      input: {
        amount,
        percentage,
      },
      result: {
        annualCouponAll: annualCoupon,
        couponPerPaymentAll: couponPerPayment,
        myCouponPerPayment: myCouponPerPayment,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "クーポン計算中にエラー", details: err });
  }
});


app.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "認証済みユーザーのみ閲覧できます",
    user: req.user,
  });
});








