const activityModel = require('../models/activity.model');

// Log fail ho jaye to bhi main request fail nahi honi chahiye
async function logActivity({ actor, action, entityType, entityId, entityName, meta }) {
  try {
    await activityModel.create({ actor, action, entityType, entityId, entityName, meta });
  } catch (error) {
    console.error('Activity log failed:', error.message);
  }
}

module.exports = { logActivity };