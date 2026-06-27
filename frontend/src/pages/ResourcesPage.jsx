import { useEffect, useState } from 'react';
import client from '../api/client';

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    client.get('/resources').then((res) => setResources(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-brand-navy mb-4">Resources</h2>
      <div className="bg-white border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Capacity</th>
              <th className="text-left p-3">Building</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource._id} className="border-t">
                <td className="p-3">{resource.name}</td>
                <td className="p-3">{resource.type}</td>
                <td className="p-3">{resource.capacity}</td>
                <td className="p-3">{resource.building}</td>
                <td className="p-3">{resource.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourcesPage;
