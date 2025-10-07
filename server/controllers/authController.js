const contractors = require('../config/contractors');

function listContractors(_req, res) {
  const payload = contractors.map(({ id, name, login, password }) => ({
    id,
    name,
    login,
    password
  }));

  res.json(payload);
}

function login(req, res) {
  const { username, password } = req.body || {};
  const contractor = contractors.find(
    (item) => item.login === username && item.password === password
  );

  if (!contractor) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({
    success: true,
    contractor: {
      id: contractor.id,
      name: contractor.name,
      login: contractor.login
    }
  });
}

module.exports = {
  listContractors,
  login
};
