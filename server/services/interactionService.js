const Interaction = require('../models/interaction'); // Assuming an Interaction model

const saveInteractions = async interactions => {
  // Save interactions to the database
  await Interaction.insertMany(interactions, { ordered: false });
};

module.exports = {
  saveInteractions
};
