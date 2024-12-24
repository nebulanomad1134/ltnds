const router = require('express').Router();
const Interaction = require('../../models/interaction'); // Adjust path as needed

// Get products with interaction counts
router.get('/products-with-interactions', async (req, res) => {
  try {
    const interactions = await Interaction.aggregate([
      { $group: { _id: '$productId', count: { $sum: 1 } } }
    ]);
    res.status(200).json(interactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch interaction data.' });
  }
});

// Save interactions (batch)
router.post('/interactions', async (req, res) => {
  try {
    const { interactions } = req.body;
    await Interaction.insertMany(interactions, { ordered: false });
    res.status(200).json({ message: 'Interactions saved successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save interactions.' });
  }
});

module.exports = router;
