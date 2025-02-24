
import { useNavigate } from 'react-router-dom';
import { Plus, FolderIcon, PenIcon } from 'lucide-react';

const Campaign = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
          <FolderIcon className="h-6 w-6" />
        </div>
        <h1 className="text-4xl font-bold">test</h1>
      </div>

      <div className="max-w-3xl">
        <div className="bg-white rounded-2xl border p-6 mb-6">
          <input
            type="text"
            placeholder="New chat in this project"
            className="w-full p-4 rounded-xl border text-gray-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Add files</h2>
              <Plus className="h-5 w-5" />
            </div>
            <p className="text-gray-600">
              Chats in this project can access file content
            </p>
          </div>

          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Add instructions</h2>
              <PenIcon className="h-5 w-5" />
            </div>
            <p className="text-gray-600">
              Tailor the way ChatGPT responds in this project
            </p>
          </div>
        </div>

        <div className="mt-16 text-center text-gray-600">
          Start a new chat, or drag an old one in
        </div>
      </div>
    </div>
  );
};

export default Campaign;
