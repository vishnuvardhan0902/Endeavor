const exp = require('express');
const userApp = exp.Router();
const verifyToken = require('../Middlewares/verifyToken');

userApp.use(exp.json());
userApp.use((req, res, next) => {
    userCollection = req.app.get('userCollection');
    next();
});

// register a new user
userApp.post('/register',async(req,res)=>{
    const newUser = req.body;
    const dbUser = await userCollection.findOne({email:newUser.email});
    if (dbUser!=null){
        res.send({
            status : "failed",
            message:'User already exists'
        })
    }
    else{
        const result = await userCollection.insertOne(newUser);
        res.send({
            status:"success",
            message:'User created successfully'
            })
        }
    }
)

    // Save a test history record for the authenticated user (requires auth)
    userApp.post('/save-history', verifyToken, async (req, res) => {
        try {
            console.log('=== SAVE HISTORY DEBUG ===');
            console.log('req.user:', req.user);
            console.log('req.body:', req.body);
            
            const email = req.user && req.user.email;
            const record = (req.body && req.body.record) || null;

            console.log('extracted email:', email);
            console.log('extracted record:', record);

            if (!email || !record) return res.status(400).send({ status: 'failed', message: 'email and record required' });

            // Ensure record has an id and takenAt
            if (!record.id) record.id = `test_${Date.now()}`;
            if (!record.takenAt) record.takenAt = new Date().toISOString();

            // Push newest record to front and keep max 50 entries
            await userCollection.updateOne(
                { email },
                { $push: { test_history: { $each: [record], $position: 0, $slice: 50 } } },
                { upsert: true }
            );

            // return the current history slice
            const doc = await userCollection.findOne({ email }, { projection: { test_history: 1, _id: 0 } });
            const history = (doc && doc.test_history) || [];
            return res.send({ status: 'success', history: history.slice(0, 50) });
        } catch (err) {
            console.error('save-history error', err);
            return res.status(500).send({ status: 'failed', message: String(err) });
        }
    });

    // Get current user's history (requires auth)
    userApp.get('/history', verifyToken, async (req, res) => {
        try {
            const email = req.user && req.user.email;
            if (!email) return res.status(400).send({ status: 'failed', message: 'email required' });
            const doc = await userCollection.findOne({ email }, { projection: { test_history: 1, _id: 0 } });
            const history = (doc && doc.test_history) || [];
            return res.send({ status: 'success', history });
        } catch (err) {
            console.error('get-history error', err);
            return res.status(500).send({ status: 'failed', message: String(err) });
        }
    });

module.exports = userApp;
