import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import HeaderDiffer from "../../components/HeaderDiffer";

export default function AboutUs() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/team`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setTeamMembers(response.data.data);
      }
    } catch (err) {
      setError("Failed to load team information");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to access About Us page.</p>
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
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About BOOKTECH Digital Library
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering learners with comprehensive educational resources and career development tools
            </p>
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
                <span className="ml-2 text-gray-600">Loading team information...</span>
              </div>
            </div>
          )}

          {/* Mission Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 text-center leading-relaxed">
              At BOOKTECH Digital Library, our mission is to provide accessible, high-quality educational resources 
              that empower learners to achieve their academic and career goals. We believe in the transformative 
              power of education and strive to create a comprehensive learning ecosystem that supports students 
              at every stage of their educational journey.
            </p>
          </div>

          {/* Values Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253a3.75 3.75 0 107.5 3.75 3.75 0 107.5 3.75 0 001.5 0v4.5a1.5 1.5 0 003 3h4.5a1.5 1.5 0 003-3V12a3.75 3.75 0 00-7.5-3.75H6.75A3.75 3.75 0 003 6.253z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">We deliver the highest quality educational content and learning experiences</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">We continuously evolve our platform with cutting-edge technology and teaching methods</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2H3a2 2 0 00-2-2V4a2 2 0 002-2h7l5 5v5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Accessibility</h3>
              <p className="text-gray-600">We ensure our resources are available to learners from all backgrounds</p>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-gray-600 mb-6">The passionate individuals behind BOOKTECH Digital Library</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="text-center">
                  <div className="relative mb-4">
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600 mb-3">{member.bio}</p>
                  
                  <div className="flex justify-center space-x-3">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        LinkedIn
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="text-gray-600 hover:text-gray-700 transition-colors"
                      >
                        Email
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get In Touch</h2>
              <p className="text-gray-600 mb-6">Have questions or feedback? We'd love to hear from you!</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  rows={4}
                  placeholder="Your message or feedback..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
