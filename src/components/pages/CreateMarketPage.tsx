// File: src/components/pages/CreateMarketPage.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePrivy } from '@privy-io/react-auth';
import { useUserStore } from '@/store/userStore';
import { AppPage } from '../../types/Navigation';
import {
  Plus,
  DollarSign,
  AlertCircle,
  CheckCircle,
  X,
  Lightbulb,
  Clock,
  Save,
  Send,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Users} from 'lucide-react';

interface CreateMarketPageProps {
  onNavigate: (page: AppPage) => void;
}

// Validation Schema
const marketSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters').max(200, 'Question must be less than 200 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(1000, 'Description must be less than 1000 characters'),
  category: z.string().min(1, 'Please select a category'),
  endDate: z.string().min(1, 'Please select an end date'),
  endTime: z.string().min(1, 'Please select an end time'),
  resolutionCriteria: z.string().min(30, 'Resolution criteria must be at least 30 characters').max(500, 'Resolution criteria must be less than 500 characters'),
  resolutionSource: z.string().min(1, 'Please specify resolution source'),
  initialLiquidity: z.number().min(0.001, 'Minimum liquidity is 0.001 ETH').max(10, 'Maximum liquidity is 10 ETH'),
  tags: z.array(z.string()).min(1, 'Please add at least one tag').max(5, 'Maximum 5 tags allowed'),
  isPublic: z.boolean(),
  allowEarlyResolution: z.boolean(),
  disputePeriod: z.number().min(24, 'Minimum dispute period is 24 hours').max(168, 'Maximum dispute period is 168 hours'),
});

type MarketFormData = z.infer<typeof marketSchema>;

const CATEGORIES = [
  { id: 'crypto', label: '🪙 Cryptocurrency', description: 'Bitcoin, Ethereum, DeFi, and crypto markets' },
  { id: 'tech', label: '💻 Technology', description: 'AI, software releases, tech company news' },
  { id: 'sports', label: '⚽ Sports', description: 'Football, basketball, soccer, Olympics' },
  { id: 'politics', label: '🏛️ Politics', description: 'Elections, policy decisions, government' },
  { id: 'finance', label: '💰 Finance', description: 'Stock markets, economic indicators, IPOs' },
  { id: 'entertainment', label: '🎬 Entertainment', description: 'Movies, music, awards, celebrities' },
  { id: 'science', label: '🔬 Science', description: 'Research, discoveries, climate, space' },
  { id: 'general', label: '📊 General', description: 'Other events and predictions' },
];

const RESOLUTION_SOURCES = [
  'Official Government Data',
  'Major News Outlets (Reuters, AP, BBC)',
  'Sports Official Results',
  'Company Financial Reports',
  'Academic Publications',
  'Blockchain/Smart Contract Data',
  'Weather Services',
  'Stock Market Data',
  'Custom Oracle Solution',
  'Community Consensus',
];

const SUGGESTED_QUESTIONS = [
  'Will Bitcoin reach $100,000 by the end of 2024?',
  'Will Apple announce a new product category in 2024?',
  'Will the next US Federal Reserve meeting result in a rate cut?',
  'Will any team go undefeated in the NFL regular season this year?',
  'Will a new AI model surpass GPT-4 in performance benchmarks by 2024?',
  'Will Tesla stock price exceed $300 by the end of Q1 2024?',
];

export function CreateMarketPage({ onNavigate }: CreateMarketPageProps) {
  const { user } = usePrivy();
  const { user: userProfile } = useUserStore();
  const [currentStep, setCurrentStep] = useState<'basics' | 'details' | 'settings' | 'preview' | 'deploy'>('basics');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [tagInput, setTagInput] = useState('');
  const [isDraft, setIsDraft] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
    trigger,
  } = useForm<MarketFormData>({
    resolver: zodResolver(marketSchema),
    defaultValues: {
      question: '',
      description: '',
      category: '',
      endDate: '',
      endTime: '',
      resolutionCriteria: '',
      resolutionSource: '',
      initialLiquidity: 0.1,
      tags: [],
      isPublic: true,
      allowEarlyResolution: false,
      disputePeriod: 48,
    },
    mode: 'onChange',
  });

  const watchedData = watch();
  const watchedTags = watch('tags') || [];

  // Calculate minimum date (24 hours from now)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  // Calculate market end date
  const getMarketEndDate = () => {
    if (watchedData.endDate && watchedData.endTime) {
      return new Date(`${watchedData.endDate}T${watchedData.endTime}`);
    }
    return null;
  };

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim()) && watchedTags.length < 5) {
      setValue('tags', [...watchedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const handleStepNavigation = async (step: typeof currentStep) => {
    // Validate current step before moving
    let fieldsToValidate: (keyof MarketFormData)[] = [];
    
    if (currentStep === 'basics') {
      fieldsToValidate = ['question', 'description', 'category'];
    } else if (currentStep === 'details') {
      fieldsToValidate = ['endDate', 'endTime', 'resolutionCriteria', 'resolutionSource'];
    } else if (currentStep === 'settings') {
      fieldsToValidate = ['initialLiquidity', 'tags'];
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
    }

    setCurrentStep(step);
  };

  const saveDraft = () => {
    const draftData = watchedData;
    localStorage.setItem('foresightcast_market_draft', JSON.stringify(draftData));
    setIsDraft(true);
    setTimeout(() => setIsDraft(false), 2000);
  };

  const loadDraft = () => {
    const savedDraft = localStorage.getItem('foresightcast_market_draft');
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);
      reset(draftData);
    }
  };

  const deployMarket = async (data: MarketFormData) => {
    setIsDeploying(true);
    setDeploymentStatus('deploying');
    
    try {
      // Simulate smart contract deployment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('Deploying market with data:', data);
      
      // In real implementation, this would:
      // 1. Deploy smart contract to Zora network
      // 2. Set up oracle connections
      // 3. Initialize market parameters
      // 4. Create NFT collection for prediction tokens
      
      setDeploymentStatus('success');
      
      // Clear draft after successful deployment
      localStorage.removeItem('foresightcast_market_draft');
      
      // Navigate to markets page after delay
      setTimeout(() => {
        onNavigate('markets');
      }, 2000);
      
    } catch (error) {
      console.error('Market deployment failed:', error);
      setDeploymentStatus('error');
    } finally {
      setIsDeploying(false);
    }
  };

  const onSubmit = (data: MarketFormData) => {
    setCurrentStep('deploy');
    deployMarket(data);
  };

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('foresightcast_market_draft');
    if (savedDraft) {
      // Ask user if they want to load draft
      const shouldLoad = window.confirm('We found a saved draft. Would you like to continue where you left off?');
      if (shouldLoad) {
        loadDraft();
      }
    }
  }, []);

  const steps = [
    { id: 'basics', title: 'Market Basics', description: 'Question and description' },
    { id: 'details', title: 'Resolution Details', description: 'End date and criteria' },
    { id: 'settings', title: 'Market Settings', description: 'Liquidity and tags' },
    { id: 'preview', title: 'Preview & Deploy', description: 'Review your market' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ✨ Create Prediction Market
            </h1>
            <p className="text-gray-600">
              Create your own prediction market and let others bet on outcomes you're interested in.
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={saveDraft}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                isDraft 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isDraft ? 'Draft Saved!' : 'Save Draft'}</span>
            </button>
            
            <button
              onClick={() => onNavigate('markets')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                    index < currentStepIndex 
                      ? 'bg-green-500 text-white' 
                      : index === currentStepIndex 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {index < currentStepIndex ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                  <div className="hidden sm:block">
                    <div className="font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Market Basics */}
          {currentStep === 'basics' && (
            <motion.div
              key="basics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-lg border p-8"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Market Basics</h2>
                <p className="text-gray-600">Define your prediction question and provide context.</p>
              </div>

              <div className="space-y-6">
                {/* Market Question */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prediction Question *
                  </label>
                  <textarea
                    {...register('question')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Will Bitcoin reach $100,000 by the end of 2024?"
                  />
                  <div className="flex justify-between mt-2">
                    <div>
                      {errors.question && (
                        <p className="text-red-500 text-sm">{errors.question.message}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {watchedData.question?.length || 0}/200
                    </span>
                  </div>
                  
                  {/* Question Suggestions */}
                  <div className="mt-3">
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                      onClick={() => {
                        const randomQuestion = SUGGESTED_QUESTIONS[Math.floor(Math.random() * SUGGESTED_QUESTIONS.length)];
                        setValue('question', randomQuestion);
                      }}
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>Get suggestion</span>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Provide context, background information, and any relevant details that will help traders understand this prediction market..."
                  />
                  <div className="flex justify-between mt-2">
                    <div>
                      {errors.description && (
                        <p className="text-red-500 text-sm">{errors.description.message}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {watchedData.description?.length || 0}/1000
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {CATEGORIES.map((category) => (
                      <label
                        key={category.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          watchedData.category === category.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          {...register('category')}
                          type="radio"
                          value={category.id}
                          className="sr-only"
                        />
                        <div>
                          <div className="font-medium text-gray-900 mb-1">{category.label}</div>
                          <div className="text-sm text-gray-600">{category.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-2">{errors.category.message}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Resolution Details */}
          {currentStep === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-lg border p-8"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Resolution Details</h2>
                <p className="text-gray-600">Set when and how this market will be resolved.</p>
              </div>

              <div className="space-y-6">
                {/* End Date and Time */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      {...register('endDate')}
                      type="date"
                      min={minDateString}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.endDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time *
                    </label>
                    <input
                      {...register('endTime')}
                      type="time"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.endTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>
                    )}
                  </div>
                </div>

                {/* Market Duration Display */}
                {getMarketEndDate() && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-900">Market Duration</div>
                        <div className="text-blue-700 text-sm">
                          Ends on {getMarketEndDate()?.toLocaleDateString()} at{' '}
                          {getMarketEndDate()?.toLocaleTimeString()} (
                          {Math.round((getMarketEndDate()!.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days)
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resolution Criteria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution Criteria *
                  </label>
                  <textarea
                    {...register('resolutionCriteria')}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Clearly define how this market will be resolved. What specific conditions must be met for 'YES' vs 'NO'? Include any edge cases or exceptions..."
                  />
                  <div className="flex justify-between mt-2">
                    <div>
                      {errors.resolutionCriteria && (
                        <p className="text-red-500 text-sm">{errors.resolutionCriteria.message}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {watchedData.resolutionCriteria?.length || 0}/500
                    </span>
                  </div>
                </div>

                {/* Resolution Source */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution Source *
                  </label>
                  <select
                    {...register('resolutionSource')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select resolution source...</option>
                    {RESOLUTION_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                  {errors.resolutionSource && (
                    <p className="text-red-500 text-sm mt-1">{errors.resolutionSource.message}</p>
                  )}
                </div>

                {/* Dispute Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dispute Period (hours) *
                  </label>
                  <Controller
                    name="disputePeriod"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <input
                          type="range"
                          min="24"
                          max="168"
                          step="24"
                          {...field}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>24h</span>
                          <span className="font-medium text-blue-600">{field.value}h</span>
                          <span>168h (7 days)</span>
                        </div>
                      </div>
                    )}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Time period after resolution during which the outcome can be disputed.
                  </p>
                  {errors.disputePeriod && (
                    <p className="text-red-500 text-sm mt-1">{errors.disputePeriod.message}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Market Settings */}
          {currentStep === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-lg border p-8"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Market Settings</h2>
                <p className="text-gray-600">Configure liquidity, tags, and market preferences.</p>
              </div>

              <div className="space-y-6">
                {/* Initial Liquidity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Liquidity (ETH) *
                  </label>
                  <Controller
                    name="initialLiquidity"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <input
                          type="number"
                          step="0.001"
                          min="0.001"
                          max="10"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.1"
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                          <span>This will be your initial bet and market liquidity</span>
                          <span>≈ ${(field.value * 2500).toFixed(2)} USD</span>
                        </div>
                      </div>
                    )}
                  />
                  {errors.initialLiquidity && (
                    <p className="text-red-500 text-sm mt-1">{errors.initialLiquidity.message}</p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags *
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add a tag..."
                      maxLength={20}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={!tagInput.trim() || watchedTags.length >= 5}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {watchedTags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    {watchedTags.length}/5 tags • Tags help users discover your market
                  </p>
                  {errors.tags && (
                    <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>
                  )}
                </div>

                {/* Market Visibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Market Visibility
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        {...register('isPublic')}
                        type="radio"
                        value="false"
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900 flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>Private Market</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Only people with the link can access this market
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Additional Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Additional Settings
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Allow Early Resolution</div>
                        <div className="text-sm text-gray-600">
                          Market can be resolved before the end date if outcome becomes certain
                        </div>
                      </div>
                      <input
                        {...register('allowEarlyResolution')}
                        type="checkbox"
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Preview */}
          {currentStep === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg border p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview Your Market</h2>
                  <p className="text-gray-600">Review all details before deploying to the blockchain.</p>
                </div>

                {/* Market Preview Card */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                      watchedData.category === 'crypto' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                      watchedData.category === 'tech' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      watchedData.category === 'sports' ? 'bg-green-100 text-green-800 border-green-200' :
                      watchedData.category === 'politics' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {CATEGORIES.find(c => c.id === watchedData.category)?.label || watchedData.category}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>
                        {getMarketEndDate() ? 
                          `${Math.round((getMarketEndDate()!.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d` : 
                          'No end date'
                        }
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                    {watchedData.question || 'Your prediction question will appear here...'}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {watchedData.description || 'Your market description will appear here...'}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">50%</div>
                      <div className="text-xs text-green-700">YES</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-600">50%</div>
                      <div className="text-xs text-red-700">NO</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="text-sm font-bold text-blue-600">
                        {watchedData.initialLiquidity || 0} ETH
                      </div>
                      <div className="text-xs text-blue-700">LIQUIDITY</div>
                    </div>
                  </div>

                  {watchedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {watchedTags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Market Details Summary */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Market Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">
                          {watchedData.endDate && watchedData.endTime 
                            ? new Date(`${watchedData.endDate}T${watchedData.endTime}`).toLocaleDateString()
                            : 'Not set'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Resolution Source:</span>
                        <span className="font-medium">{watchedData.resolutionSource || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dispute Period:</span>
                        <span className="font-medium">{watchedData.disputePeriod}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Visibility:</span>
                        <span className="font-medium">
                          {watchedData.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Resolution Criteria</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-700 text-sm">
                        {watchedData.resolutionCriteria || 'Resolution criteria not set...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Deployment Cost Estimate */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Deployment Cost Estimate</h4>
                      <div className="text-blue-800 text-sm mt-1 space-y-1">
                        <div className="flex justify-between">
                          <span>Smart Contract Deployment:</span>
                          <span>~0.002 ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Initial Liquidity:</span>
                          <span>{watchedData.initialLiquidity || 0} ETH</span>
                        </div>
                        <div className="flex justify-between font-medium border-t border-blue-300 pt-1">
                          <span>Total Cost:</span>
                          <span>~{((watchedData.initialLiquidity || 0) + 0.002).toFixed(4)} ETH</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Deploy */}
          {currentStep === 'deploy' && (
            <motion.div
              key="deploy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border p-8 text-center"
            >
              {deploymentStatus === 'deploying' && (
                <div>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Deploying Your Market</h2>
                  <p className="text-gray-600 mb-6">
                    Your prediction market is being deployed to the Zora blockchain...
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Validating market parameters</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Deploying smart contract</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-gray-400">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      <span>Initializing market</span>
                    </div>
                  </div>
                </div>
              )}

              {deploymentStatus === 'success' && (
                <div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Market Created Successfully! 🎉</h2>
                  <p className="text-gray-600 mb-6">
                    Your prediction market has been deployed to the Zora blockchain and is now live.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center space-x-2 text-green-800">
                      <ExternalLink className="w-4 h-4" />
                      <span className="font-medium">Contract: 0x1234...5678</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Redirecting to markets page...
                  </p>
                </div>
              )}

              {deploymentStatus === 'error' && (
                <div>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Deployment Failed</h2>
                  <p className="text-gray-600 mb-6">
                    There was an error deploying your market. Please try again.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setCurrentStep('preview')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Back to Preview
                    </button>
                    <button
                      onClick={() => deployMarket(watchedData as MarketFormData)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {currentStep !== 'deploy' && (
          <div className="flex justify-between">
            <div>
              {currentStep !== 'basics' && (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = steps.findIndex(s => s.id === currentStep);
                    if (currentIndex > 0) {
                      setCurrentStep(steps[currentIndex - 1].id as any);
                    }
                  }}
                  className="flex items-center space-x-2 px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {currentStep !== 'preview' ? (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = steps.findIndex(s => s.id === currentStep);
                    if (currentIndex < steps.length - 1) {
                      handleStepNavigation(steps[currentIndex + 1].id as any);
                    }
                  }}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isValid || isDeploying}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>Deploy Market</span>
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}