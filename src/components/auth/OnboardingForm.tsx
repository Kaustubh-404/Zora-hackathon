import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Tag, ArrowRight, Sparkles } from 'lucide-react';

// Validation Schema
const onboardingSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  bio: z.string().max(200, 'Bio must be less than 200 characters').optional(),
  interests: z.array(z.string()).min(1, 'Please select at least one interest'),
  notificationPreferences: z.object({
    email: z.boolean(),
    push: z.boolean(),
    predictions: z.boolean(),
  }),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingFormProps {
  userData: any;
  farcasterInterests?: string[];
  onComplete: (formData: OnboardingFormData) => void;
  onSkip?: () => void;
}

const INTEREST_CATEGORIES = [
  { id: 'crypto', label: '🪙 Crypto & DeFi', popular: true },
  { id: 'nft', label: '🎨 NFTs & Digital Art', popular: true },
  { id: 'tech', label: '💻 Technology', popular: true },
  { id: 'ai', label: '🤖 Artificial Intelligence', popular: true },
  { id: 'finance', label: '💰 Finance & Markets', popular: true },
  { id: 'sports', label: '⚽ Sports', popular: false },
  { id: 'gaming', label: '🎮 Gaming & Esports', popular: false },
  { id: 'politics', label: '🏛️ Politics & Current Events', popular: false },
  { id: 'entertainment', label: '🎬 Entertainment & Media', popular: false },
  { id: 'science', label: '🔬 Science & Research', popular: false },
  { id: 'business', label: '📈 Business & Startups', popular: false },
  { id: 'social', label: '👥 Social & Community', popular: false },
];

export function OnboardingForm({ userData, farcasterInterests = [], onComplete, onSkip }: OnboardingFormProps) {
  const [step, setStep] = useState<'profile' | 'interests' | 'notifications'>('profile');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    farcasterInterests.length > 0 ? farcasterInterests.slice(0, 5) : []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: userData?.farcaster?.displayName || '',
      email: '',
      phone: '',
      bio: '',
      interests: selectedInterests,
      notificationPreferences: {
        email: true,
        push: true,
        predictions: true,
      },
    },
    mode: 'onChange',
  });

  const handleInterestToggle = (interestId: string) => {
    const newInterests = selectedInterests.includes(interestId)
      ? selectedInterests.filter(id => id !== interestId)
      : [...selectedInterests, interestId];
    
    setSelectedInterests(newInterests);
    setValue('interests', newInterests, { shouldValidate: true });
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof OnboardingFormData)[] = [];
    
    if (step === 'profile') {
      fieldsToValidate = ['displayName', 'email', 'phone', 'bio'];
    } else if (step === 'interests') {
      fieldsToValidate = ['interests'];
    }

    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      if (step === 'profile') {
        setStep('interests');
      } else if (step === 'interests') {
        setStep('notifications');
      }
    }
  };

  const handleBack = () => {
    if (step === 'interests') {
      setStep('profile');
    } else if (step === 'notifications') {
      setStep('interests');
    }
  };

  const onSubmit = (data: OnboardingFormData) => {
    const formData = {
      ...data,
      interests: selectedInterests,
    };
    onComplete(formData);
  };

  const watchedBio = watch('bio') || '';

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to ForesightCast!
        </h2>
        <p className="text-gray-600">
          Let's personalize your prediction experience
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[
            { key: 'profile', name: 'Profile' },
            { key: 'interests', name: 'Interests' },
            { key: 'notifications', name: 'Notifications' }
          ].map((stepItem, index) => {
            const isActive = step === stepItem.key;
            const isCompleted = ['profile', 'interests', 'notifications'].indexOf(step) > index;
            
            return (
              <React.Fragment key={stepItem.key}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                {index < 2 && (
                  <div className={`w-12 h-1 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Profile Information */}
        {step === 'profile' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Profile Information</h3>
              <p className="text-gray-600">Tell us a bit about yourself</p>
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                Display Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('displayName')}
                  id="displayName"
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your display name"
                />
              </div>
              {errors.displayName && (
                <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('phone')}
                  id="phone"
                  type="tel"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio (Optional)
              </label>
              <textarea
                {...register('bio')}
                id="bio"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Tell us about yourself and your prediction expertise..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {watchedBio.length}/200 characters
              </p>
              {errors.bio && (
                <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 2: Interest Selection */}
        {step === 'interests' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your Interests</h3>
              <p className="text-gray-600">
                {farcasterInterests.length > 0 
                  ? "We've pre-selected some interests based on your Farcaster activity. Add or remove as needed."
                  : "Select topics you're interested in to get personalized predictions"
                }
              </p>
            </div>

            {farcasterInterests.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">From your Farcaster activity:</h4>
                <div className="flex flex-wrap gap-2">
                  {farcasterInterests.slice(0, 8).map((interest) => (
                    <span key={interest} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      #{interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Tag className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-700">Popular Categories</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {INTEREST_CATEGORIES.filter(cat => cat.popular).map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleInterestToggle(category.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedInterests.includes(category.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="font-medium">{category.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Tag className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-700">More Categories</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {INTEREST_CATEGORIES.filter(cat => !cat.popular).map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleInterestToggle(category.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedInterests.includes(category.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>Selected:</strong> {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''}
                {selectedInterests.length === 0 && ' (Please select at least one)'}
              </p>
            </div>

            {errors.interests && (
              <p className="text-red-500 text-sm">{errors.interests.message}</p>
            )}
          </motion.div>
        )}

        {/* Step 3: Notification Preferences */}
        {step === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Notification Preferences</h3>
              <p className="text-gray-600">Choose how you'd like to stay updated</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Get updates about your predictions and new markets</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    {...register('notificationPreferences.email')}
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Push Notifications</h4>
                  <p className="text-sm text-gray-600">Real-time alerts for market updates and resolutions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    {...register('notificationPreferences.push')}
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Prediction Reminders</h4>
                  <p className="text-sm text-gray-600">Reminders about markets ending soon and new opportunities</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    {...register('notificationPreferences.predictions')}
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <div>
            {step !== 'profile' && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
          
          <div className="flex space-x-4">
            {onSkip && step === 'profile' && (
              <button
                type="button"
                onClick={onSkip}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Skip Setup
              </button>
            )}
            
            {step !== 'notifications' ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={step === 'interests' && selectedInterests.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <span>Complete Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}