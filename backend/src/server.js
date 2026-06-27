const bcrypt = require('bcryptjs');
const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');
const User = require('./models/User');
const Resource = require('./models/Resource');
const SystemSetting = require('./models/SystemSetting');
const { ROLES } = require('./utils/constants');
const startNoShowJob = require('./jobs/noShowJob');

const seedDefaults = async () => {
  await SystemSetting.ensureDefaults();

  const resources = [
    {
      name: 'Main Auditorium',
      type: 'Auditorium',
      capacity: 500,
      building: 'Main Block',
      floor: 'Ground',
      description: 'College central auditorium',
      facilities: ['Projector', 'AC', 'Sound System'],
      projectorAvailable: true,
      acAvailable: true,
      soundSystemAvailable: true,
    },
    {
      name: 'Meeting Room A',
      type: 'Meeting Room',
      capacity: 15,
      building: 'Admin Block',
      floor: '1',
      facilities: ['Projector', 'AC'],
      projectorAvailable: true,
      acAvailable: true,
    },
    {
      name: 'Meeting Room B',
      type: 'Meeting Room',
      capacity: 20,
      building: 'Admin Block',
      floor: '1',
      facilities: ['AC'],
      acAvailable: true,
    },
  ];

  await Promise.all(
    resources.map((resource) =>
      Resource.updateOne({ name: resource.name }, { $setOnInsert: resource }, { upsert: true })
    )
  );

  const adminExists = await User.findOne({ role: ROLES.SUPER_ADMIN });
  if (!adminExists) {
    await User.create({
      name: 'System Super Admin',
      employeeId: 'SUPER001',
      role: ROLES.SUPER_ADMIN,
      passwordHash: await bcrypt.hash('Admin@123', 10),
      isActive: true,
      mustChangePassword: true,
      department: 'Administration',
    });
  }
};

const start = async () => {
  await connectDB();
  await seedDefaults();
  startNoShowJob();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${env.port}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  start().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
  });
}

module.exports = { start, seedDefaults };
