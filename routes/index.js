const categoriesRoute = require('./categoriesRoute');
const productsRoute = require('./productsRoute');
const authRoute = require('./authRoute');
const cartRoutes = require('./cartRoutes');
const orderRoute = require('./orderRoute');
const skuRoute = require('./skuRoute');
const userRoute = require('./usersRoute');
const multer = require('multer');
const firebase = require('../config/firebase');
const { isEmpty } = require('../config/function');
const orderModel = require('../models/order');
const { loginCheck } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage()
}).single('file');

const uploads = multer({
  storage: multer.memoryStorage()
}).any();

function route(app) {
  app.use("/categories", categoriesRoute);
  app.use("/products", productsRoute);
  app.use("/auth", authRoute);
  app.use("/cart", cartRoutes);
  app.use("/skus", skuRoute);
  app.use("/order", orderRoute);
  app.use("/user", userRoute);
  app.post("/revenue", loginCheck, (req, res) => {
    //year: 0, month: 1, day: 2
    const { option, data } = req.body;
    switch (option) {
      case 0:
        orderModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(`${data.year}-01-01`),
                $lt: new Date(`${data.year + 1}-01-01`)
              }
            }
          },
          {
            $unwind: {
              path: '$products'
            }
          },
          {
            $group: {
              // Group by both month and year of the sale
              _id :{ $dateToString: { format: "%Y-%m", date: "$createdAt"} },
              // Count the no of sales
              price: {
                $sum: "$price"
              },
              quantity: {
                $sum: "$products.quantity"
              }
            }
          },
          { $sort : { 
            _id : 1 
            } 
          },
        ])
          .then(result => {
            return res.status(200).json({ result });
          })
          .catch(error => {
            return res.status(500)
          })
        break;
      case 1:
        orderModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(`${data.year}-${data.month}-01`),
                $lt: new Date(`${data.year}-${data.month + 1}-01`)
              }
            }
          },
          {
            $unwind: {
              path: '$products'
            }
          },
          {
            $group: {
              // Group by both month and year of the sale
              _id :{ $dateToString: { format: "%Y-%m-%d", date: "$createdAt"} },
              // Count the no of sales
              price: {
                $sum: "$price"
              },
              quantity: {
                $sum: "$products.quantity"
              }
            }
          },
          { $sort : { 
            _id : 1 
            } 
          },
        ])
          .then(result => {
            return res.status(200).json({ result });
          })
          .catch(error => {
            return res.status(500)
          })
        break;
      case 2:
        orderModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(`${data.year}-${data.month}-${data.day}`),
                $lt: new Date(`${data.year}-${data.month}-${data.day + 1}`)
              }
            }
          },
          {
            $unwind: {
              path: '$products'
            }
          },
          {
            $group: {
              // Group by both month and year of the sale
              _id :{ $dateToString: { format: "%Y-%m-%d", date: "$createdAt"} },
              // Count the no of sales
              price: {
                $sum: "$price"
              },
              quantity: {
                $sum: "$products.quantity"
              }
            }
          },
        ])
          .then(result => {
            return res.status(200).json({ result });
          })
          .catch(error => {
            return res.status(500)
          })
        break;
      default: break;
    }
  })

  app.post('/uploadiu', upload, (req, res) => {
    if (!req.file) {
      return res.status(400).send("Error: No files found")
    }


    const image = firebase.bucket.file(req.file.originalname)

    const imageWriter = image.createWriteStream({
      metadata: {
        contentType: req.file.mimetype
      }
    })

    imageWriter.on('error', (err) => {
      console.log(req.file)
    })

    imageWriter.on('finish', () => {
      // Assembling public URL for accessing the file via HTTP
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${firebase.bucket.name
        }/o/${encodeURI(image.name)}?alt=media`;

      // Return the file name and its public URL
      res
        .status(200)
        .json({ fileName: req.file.originalname, fileLocation: publicUrl });
    });

    // When there is no more data to be consumed from the stream
    imageWriter.end(req.file.buffer);

  })

  // This is a sample test API key.
  const stripe = require("stripe")('sk_test_51JN6JuAe7sFLRsUwtxjhu3xusD0h6B1KOSXj3PlS6wL8rUz8ag3WK01IHGiZ1KqgfWGGgOuhmhlXLQkKcKGiY5Qv00rODfbW4J');

  const calculateOrderAmount = (items) => {
    return items.reduce((sum, productCart) => {
      const price = isEmpty(productCart.sku) ? productCart.product.minPrice : productCart.sku.price;
      const quantity = productCart.quantity;
      return sum + quantity * (price || 0);
    }, 0) || 0;
  };

  app.post("/create-payment-intent", async (req, res) => {
    const { totalPrice } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice,
      currency: "vnd",
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  });


  app.post('/uploads', uploads, (req, res) => {
    if (!req.files.length) {
      return res.status(400).send("Error: No files found")
    }
    imagesUrl = [];
    req.files.forEach(file => {
      const image = firebase.bucket.file(file.originalname)

      const imageWriter = image.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      })

      imageWriter.on('error', (err) => {
        console.log(req.file);
        return res.status(500).send("Server error");
      })

      imageWriter.on('finish', () => {
        // Assembling public URL for accessing the file via HTTP
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${firebase.bucket.name
          }/o/${encodeURI(image.name)}?alt=media`;

        imagesUrl.push(publicUrl);
        if (imagesUrl.length === req.files.length) {
          // Return the file name and its public URL
          return res
            .status(200)
            .json({ filesLocation: imagesUrl });
        }

      });

      // When there is no more data to be consumed from the stream
      imageWriter.end(file.buffer);
    });

  })
}

module.exports = route;
