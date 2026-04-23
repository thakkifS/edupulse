import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import HeaderDiffer from "../../components/HeaderDiffer";

export default function CareerFinder() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  
  const [careers, setCareers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    { id: "all", name: "All Careers", icon: "🌟" },
    { id: "technology", name: "Technology", icon: "💻" },
    { id: "healthcare", name: "Healthcare", icon: "🏥" },
    { id: "education", name: "Education", icon: "📚" },
    { id: "business", name: "Business", icon: "💼" },
    { id: "creative", name: "Creative Arts", icon: "🎨" },
    { id: "engineering", name: "Engineering", icon: "⚙️" }
  ];

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    fetchCareers();
  }, [user]);

  const fetchCareers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/careers`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setCareers(response.data.data);
      }
    } catch (err) {
      setError("Failed to load careers");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCareers = careers.filter(career => {
    const matchesSearch = career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || career.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCareerClick = (careerId) => {
    if (!careerId || typeof careerId !== 'string') {
      console.error('Career ID is undefined or invalid');
      return;
    }
    router.push(`/student/career-finder/${careerId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to access Career Finder.</p>
          <button
            onClick={() => router.push('/auth')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeaderDiffer />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Career Finder
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover your perfect career path with AI-powered recommendations and insights
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Careers</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for careers..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 011 14 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 0116 0zm1 0h8a1 1 0 110 0 1 1 0 01-1 1zm-1 0a1 1 0 00-2 0v8a1 1 0 002 0v-8z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H0z"></path>
                </svg>
                <span className="ml-2 text-gray-600">Loading careers...</span>
              </div>
            </div>
          )}

          {/* Careers Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCareers.map((career) => (
                <div
                  key={career.id}
                  onClick={() => handleCareerClick(career.id)}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                >
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4">{career.icon}</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{career.title}</h3>
                      <p className="text-sm text-blue-600 font-medium">{career.category}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">{career.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {career.minSalary && `Min: $${career.minSalary.toLocaleString()}`}
                      </span>
                      <span className="text-sm text-green-600 font-medium">
                        {career.maxSalary && `Max: $${career.maxSalary.toLocaleString()}`}
                      </span>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Explore Career
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && filteredCareers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No careers found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or browse different categories
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
