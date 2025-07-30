import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Users, Wifi, Coffee, Calendar, MapPin, Clock, ArrowRight, Star } from 'lucide-react';

const PublicHomepage = () => {
  const { subdomain } = useParams();
  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo purposes, use static data
    // In production, this would fetch from API using subdomain
    setTenantData({
      name: "Downtown Coworking Hub",
      tagline: "Where Innovation Meets Community",
      description: "Join our vibrant coworking community and connect with like-minded professionals in the heart of downtown.",
      hero_image: "https://customer-assets.emergentagent.com/job_modular-cms/artifacts/29sx6yl2_01-home-en.png",
      stats: [
        { number: "500+", label: "Active Members" },
        { number: "50+", label: "Events Monthly" },
        { number: "24/7", label: "Access" },
        { number: "99%", label: "Satisfaction" }
      ],
      amenities: [
        { name: "High-Speed WiFi", icon: Wifi, description: "Enterprise-grade internet" },
        { name: "Coffee Bar", icon: Coffee, description: "Unlimited premium coffee" },
        { name: "Meeting Rooms", icon: Users, description: "Bookable conference spaces" },
        { name: "Events", icon: Calendar, description: "Weekly networking events" }
      ],
      membership_plans: [
        {
          name: "Day Pass",
          price: "$25",
          billing: "per day",
          features: ["Access to open workspace", "High-speed WiFi", "Coffee & tea", "Community events"],
          popular: false
        },
        {
          name: "Hot Desk",
          price: "$200",
          billing: "per month",
          features: ["Flexible seating", "24/7 access", "Meeting room credits", "Networking events", "Mail handling"],
          popular: true
        },
        {
          name: "Dedicated Desk",
          price: "$350",
          billing: "per month",
          features: ["Your own desk", "Storage locker", "Priority booking", "Phone booth access", "Guest passes"],
          popular: false
        }
      ],
      testimonials: [
        {
          quote: "This community has completely transformed how I work. The energy and collaboration opportunities are incredible!",
          author: "Sarah Johnson",
          title: "Freelance Designer",
          rating: 5
        },
        {
          quote: "Best decision I made for my startup. The networking alone has been worth every penny, plus the amenities are top-notch.",
          author: "Michael Chen",
          title: "Tech Entrepreneur",
          rating: 5
        }
      ],
      contact: {
        address: "123 Innovation Street, Downtown, City 12345",
        phone: "(555) 123-4567",
        email: "hello@downtownhub.com",
        hours: "Mon-Fri: 8AM-8PM, Weekends: 9AM-6PM"
      }
    });
    setLoading(false);
  }, [subdomain]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tenantData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Coworking Space Not Found</h1>
          <p className="text-gray-600">The requested coworking space could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">{tenantData.name}</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="#membership" className="text-gray-600 hover:text-gray-900">Membership</a>
              <a href="#amenities" className="text-gray-600 hover:text-gray-900">Amenities</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Join Today
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {tenantData.tagline}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              {tenantData.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="#tour"
                className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Take a Tour
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {tenantData.stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our coworking space is designed with productivity and community in mind
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tenantData.amenities.map((amenity, index) => {
              const IconComponent = amenity.icon;
              return (
                <div key={index} className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-lg mb-4">
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {amenity.name}
                  </h3>
                  <p className="text-gray-600">
                    {amenity.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section id="membership" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Membership
            </h2>
            <p className="text-xl text-gray-600">
              Flexible plans designed for every type of professional
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tenantData.membership_plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-lg p-8 relative ${
                  plan.popular ? 'ring-2 ring-blue-600 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {plan.price}
                  </div>
                  <div className="text-gray-600 mb-6">
                    {plan.billing}
                  </div>
                  <ul className="text-left space-y-3 mb-8">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-center">
                        <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Members Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tenantData.testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.author}
                  </div>
                  <div className="text-gray-600">
                    {testimonial.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & CTA */}
      <section id="contact" className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Take the next step in your professional journey. Start with a free day pass and experience what we're all about.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Free Day Pass
            </Link>
            <Link
              to="/tour"
              className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Schedule Tour
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 mr-3 flex-shrink-0" />
              <div>
                <div className="font-semibold">Address</div>
                <div className="text-blue-100">{tenantData.contact.address}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-6 w-6 mr-3 flex-shrink-0" />
              <div>
                <div className="font-semibold">Hours</div>
                <div className="text-blue-100">{tenantData.contact.hours}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Users className="h-6 w-6 mr-3 flex-shrink-0" />
              <div>
                <div className="font-semibold">Contact</div>
                <div className="text-blue-100">{tenantData.contact.phone}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{tenantData.name}</h3>
              <p className="text-gray-400 mb-4">
                Creating spaces where innovation thrives and community grows.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white">About</a></li>
                <li><a href="#membership" className="hover:text-white">Membership</a></li>
                <li><a href="#amenities" className="hover:text-white">Amenities</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white">Help Center</a></li>
                <li><a href="/guidelines" className="hover:text-white">Guidelines</a></li>
                <li><a href="/terms" className="hover:text-white">Terms</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">Instagram</a></li>
                <li><a href="/newsletter" className="hover:text-white">Newsletter</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 {tenantData.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHomepage;