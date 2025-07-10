
import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { ArrowRight, Users, Zap, Trophy, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const { login, authenticated } = usePrivy();

  const handleGetStarted = () => {
    if (authenticated) {
      onGetStarted();
    } else {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Logo/Brand */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-6xl font-bold text-gradient mb-4">
                ForesightCast
              </h1>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Sparkles className="w-5 h-5" />
                <span className="text-lg">Social Prediction Marketplace</span>
                <Sparkles className="w-5 h-5" />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Predict the Future,<br />
              <span className="text-gradient">Earn the Rewards</span>
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Swipe through personalized prediction markets powered by your Farcaster activity. 
              Make predictions, collect NFTs, and win rewards on Zora Network.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <button
                onClick={handleGetStarted}
                className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span>{authenticated ? 'Enter App' : 'Start Predicting'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="text-gray-600 hover:text-gray-900 px-8 py-4 rounded-full font-medium transition-colors">
                Watch Demo
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap justify-center gap-8 text-center"
            >
              <div>
                <div className="text-3xl font-bold text-blue-600">1,000+</div>
                <div className="text-sm text-gray-500">Predictions Made</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">50+</div>
                <div className="text-sm text-gray-500">Active Predictors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">10 ETH</div>
                <div className="text-sm text-gray-500">Total Volume</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-bounce delay-1000"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Why ForesightCast?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The first prediction marketplace that knows what you care about
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center p-8 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">
                Social-Powered
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Connect your Farcaster to get personalized prediction topics based on your real interests and activity.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center p-8 rounded-2xl bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">
                AI-Generated
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Advanced AI creates engaging prediction topics tailored specifically to your interests and expertise.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center p-8 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors"
            >
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">
                NFT Rewards
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Successful predictions become collectible NFTs on Zora. Build your reputation and earn rewards.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <p className="text-xl text-gray-600">
              Four simple steps to start earning from your predictions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                title: "Connect",
                description: "Link your wallet and optionally connect Farcaster for personalization"
              },
              {
                step: "2", 
                title: "Swipe",
                description: "Browse AI-generated predictions tailored to your interests"
              },
              {
                step: "3",
                title: "Predict",
                description: "Place bets on outcomes you're confident about"
              },
              {
                step: "4",
                title: "Collect",
                description: "Earn rewards and mint NFTs for successful predictions"
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {item.step}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-4xl font-bold text-white mb-6">
              Ready to Predict the Future?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join the smartest predictors on Zora Network and start earning from your insights today.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {authenticated ? 'Enter App' : 'Get Started Now'}
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}