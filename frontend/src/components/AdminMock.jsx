import { useState, useEffect } from "react";
import { loginUser, logoutUser } from "../api/auth";
import { createTopic, createMedia, fetchTopics } from "../api/topics";
import DialogBox from "../components/DialogBox"; // ✅ import here

export default function AdminMock() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken")
  );
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [topicData, setTopicData] = useState({
    title: "",
    letter: "",
    theme: "",
    description: "",
    thumbnail: null,
  });
  const [mediaData, setMediaData] = useState({
    media_type: "youtube",
    media_url: "",
    uploaded_file: null,
    autoplay: true,
    allow_controls: true,
  });
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState({ show: false, message: "", type: "" }); // ✅ dialog state

  // ───────────────────────────────
  // AUTH
  // ───────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginUser(formData.username, formData.password);
      setIsLoggedIn(true);
      loadTopics();
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
  };

  // ───────────────────────────────
  // FETCH TOPICS
  // ───────────────────────────────
  const loadTopics = async () => {
    try {
      const data = await fetchTopics();
      setTopics(data);
    } catch (err) {
      console.error("Error loading topics:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) loadTopics();
  }, [isLoggedIn]);

  // ───────────────────────────────
  // ADD TOPIC + MEDIA
  // ───────────────────────────────
  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setDialog({ show: false, message: "", type: "" });

    try {
      const topic = await createTopic(topicData);

      // Upload media if any
      if (mediaData.media_url || mediaData.uploaded_file) {
        await createMedia({ topic: topic.id, ...mediaData });
      }

      // Reset form
      setTopicData({
        title: "",
        letter: "",
        theme: "",
        description: "",
        thumbnail: null,
      });
      setMediaData({
        media_type: "youtube",
        media_url: "",
        uploaded_file: null,
        autoplay: true,
        allow_controls: true,
      });

      loadTopics();

      // ✅ Success dialog
      setDialog({
        show: true,
        message: "✅ Topic and media saved successfully!",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setDialog({
        show: true,
        message: `❌ ${err.message || "Failed to save topic"}`,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // ───────────────────────────────
  // LOGIN FORM
  // ───────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500 rounded-lg text-white text-lg font-bold mb-3">
              PL
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Login Account</h1>
            <p className="text-gray-600 mt-1">Manage educational content</p>
          </div>

          <form
            onSubmit={handleLogin}
            className="bg-white rounded-lg border p-6 space-y-4 shadow-sm"
          >
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              disabled={loading}
              className={`w-full bg-emerald-500 text-white py-2 rounded-md font-medium ${
                loading ? "opacity-50" : "hover:bg-emerald-600"
              }`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ───────────────────────────────
  // DASHBOARD VIEW
  // ───────────────────────────────
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ✅ Dialog component */}
      <DialogBox
        show={dialog.show}
        message={dialog.message}
        type={dialog.type}
        onClose={() => setDialog({ ...dialog, show: false })}
      />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Manager</h1>
          <p className="text-gray-600">Add topics and upload media</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          Sign Out
        </button>
      </div>

      {/* Add Topic Form */}
      <form
        onSubmit={handleTopicSubmit}
        className="bg-white border p-6 rounded-lg shadow-sm space-y-4 mb-6"
      >
        <h2 className="text-lg font-semibold text-gray-900">Add New Topic</h2>

        <input
          placeholder="Title (e.g., A — Alligator)"
          className="w-full border px-3 py-2 rounded-md"
          value={topicData.title}
          onChange={(e) =>
            setTopicData({ ...topicData, title: e.target.value })
          }
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Letter (A-Z)"
            className="border px-3 py-2 rounded-md"
            value={topicData.letter}
            onChange={(e) =>
              setTopicData({ ...topicData, letter: e.target.value })
            }
          />
          <input
            placeholder="Theme (e.g., Jungle)"
            className="border px-3 py-2 rounded-md"
            value={topicData.theme}
            onChange={(e) =>
              setTopicData({ ...topicData, theme: e.target.value })
            }
          />
        </div>

        <textarea
          placeholder="Description"
          className="w-full border px-3 py-2 rounded-md"
          value={topicData.description}
          onChange={(e) =>
            setTopicData({ ...topicData, description: e.target.value })
          }
          rows={3}
        />

        <div>
          <label className="text-sm font-medium text-gray-700">
            Thumbnail (optional)
          </label>
          <input
            type="file"
            onChange={(e) =>
              setTopicData({ ...topicData, thumbnail: e.target.files[0] })
            }
          />
        </div>

        <hr className="my-4" />

        {/* Media Info */}
        <h3 className="text-md font-semibold">Attach Media</h3>
        <select
          className="border px-3 py-2 rounded-md w-full"
          value={mediaData.media_type}
          onChange={(e) =>
            setMediaData({ ...mediaData, media_type: e.target.value })
          }
        >
          <option value="youtube">YouTube</option>
          <option value="mp4">Upload MP4</option>
          <option value="story">Narrated Story</option>
        </select>

        {mediaData.media_type === "youtube" && (
          <input
            placeholder="YouTube URL"
            className="w-full border px-3 py-2 rounded-md"
            value={mediaData.media_url}
            onChange={(e) =>
              setMediaData({ ...mediaData, media_url: e.target.value })
            }
          />
        )}

        {mediaData.media_type === "mp4" && (
          <input
            type="file"
            accept="video/mp4"
            onChange={(e) =>
              setMediaData({ ...mediaData, uploaded_file: e.target.files[0] })
            }
          />
        )}

        <button
          disabled={saving}
          className={`w-full bg-emerald-500 text-white py-2 rounded-md mt-2 ${
            saving ? "opacity-60 cursor-not-allowed" : "hover:bg-emerald-600"
          }`}
        >
          {saving ? "Saving..." : "Save Topic + Media"}
        </button>
      </form>

      {/* Topics List */}
      <div className="bg-white border p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Existing Topics</h3>
        {topics.length === 0 ? (
          <p className="text-gray-500">No topics added yet.</p>
        ) : (
          <ul className="space-y-2">
            {topics.map((t) => (
              <li key={t.id} className="border p-3 rounded-md">
                <p className="font-medium text-gray-800">{t.title}</p>
                <p className="text-sm text-gray-500">
                  {t.media?.length || 0} media attached
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
