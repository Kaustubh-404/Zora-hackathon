// src/components/pages/CreateMarketPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePrivy } from '@privy-io/react-auth';
import { useAllMarkets } from '@/hooks/useAllMarkets';
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
  Users,
  Loader2
} from 'lucide-react';

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
  initialLiquidity: z.number().min(0.001, 'Minimum liquidity is 0.001 ETH').max(10, 'Maximum liquidity is 10 ETH'),
  initialOutcome: z.boolean(),
  tags: z.array(z.string()).min(1, 'Please add at least one tag').max(5, 'Maximum 5 tags allowed'),
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
  const { createMarket } = useAllMarkets();
  const [currentStep, setCurrentStep] = useState<'basics' | 'details' | 'settings' | 'preview' | 'deploy'>('basics');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [deploymentTxHash, setDeploymentTxHash] = useState<string | null>(null);
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
      initialLiquidity: 0.1,
      initialOutcome: true,
      tags: [],
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
      fieldsToValidate = ['endDate', 'endTime', 'resolutionCriteria'];
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
    if (!user?.wallet?.address) {
      setDeploymentError('Please connect your wallet to create a market');
      setDeploymentStatus('error');
      return;
    }

    setIsDeploying(true);
    setDeploymentStatus('deploying');
    setDeploymentError(null);
    
    try {
      console.log('🚀 Deploying market to blockchain...');
      
      // Calculate duration in seconds
      const endDate = new Date(`${data.endDate}T${data.endTime}`);
      const duration = Math.floor((endDate.getTime() - Date.now()) / 1000);
      
      const marketData = {
        question: data.question,
        description: data.description,
        category: data.category,
        resolutionCriteria: data.resolutionCriteria,
        duration,
        initialBetAmount: data.initialLiquidity.toString(),
        initialOutcome: data.initialOutcome,
      };

      console.log('📊 Market data:', marketData);
      
      const result = await createMarket(user.wallet.address, marketData);
      
      if (result.success) {
        console.log('✅ Market deployed successfully!', result);
        setDeploymentTxHash(result.txHash || null);
        setDeploymentStatus('success');
        
        // Clear draft after successful deployment
        localStorage.removeItem('foresightcast_market_draft');
        
        // Navigate to markets page after delay
        setTimeout(() => {
          onNavigate('markets');
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to deploy market');
      }
      
    } catch (error) {
      console.error('❌ Market deployment failed:', error);
      setDeploymentError(error instanceof Error ? error.message : 'Unknown deployment error');
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
              ⛓️ Create Blockchain Market
            </h1>
            <p className="text-gray-600">
              Deploy your prediction market as a smart contract on Zora Network
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
                <p className="text-gray-600">Configure initial liquidity and market metadata.</p>
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
                          <span>This will be your initial bet and provides market liquidity</span>
                          <span>≈ ${(field.value * 2500).toFixed(2)} USD</span>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                          <p className="text-yellow-800 text-sm">
                            <strong>Note:</strong> You'll pay {field.value} ETH + 0.001 ETH creation fee = {(field.value + 0.001).toFixed(3)} ETH total
                          </p>
                        </div>
                      </div>
                    )}
                  />
                  {errors.initialLiquidity && (
                    <p className="text-red-500 text-sm mt-1">{errors.initialLiquidity.message}</p>
                  )}
                </div>

                {/* Initial Outcome Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Your Initial Prediction *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      watchedData.initialOutcome === true
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        {...register('initialOutcome')}
                        type="radio"
                        value="true"
                        onChange={() => setValue('initialOutcome', true)}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="text-xl font-bold mb-1">YES</div>
                        <div className="text-sm">I predict this will happen</div>
                      </div>
                    </label>
                    
                    <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      watchedData.initialOutcome === false
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        {...register('initialOutcome')}
                        type="radio"
                        value="false"
                        onChange={() => setValue('initialOutcome', false)}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="text-xl font-bold mb-1">NO</div>
                        <div className="text-sm">I predict this won't happen</div>
                      </div>
                    </label>
                  </div>
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
                  <p className="text-gray-600">Review all details before deploying to the Zora blockchain.</p>
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
                    <div className={`text-center p-2 rounded-lg ${
                      watchedData.initialOutcome ? 'bg-green-50' : 'bg-gray-50'
                    }`}>
                      <div className={`text-lg font-bold ${
                        watchedData.initialOutcome ? 'text-green-600' : 'text-gray-600'
                      }`}>50%</div>
                      <div className="text-xs text-gray-500">YES</div>
                    </div>
                    <div className={`text-center p-2 rounded-lg ${
                      !watchedData.initialOutcome ? 'bg-red-50' : 'bg-gray-50'
                    }`}>
                      <div className={`text-lg font-bold ${
                        !watchedData.initialOutcome ? 'text-red-600' : 'text-gray-600'
                      }`}>50%</div>
                      <div className="text-xs text-gray-500">NO</div>
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

                {/* Deployment Cost Estimate */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Deployment Cost Breakdown</h4>
                      <div className="text-blue-800 text-sm mt-1 space-y-1">
                        <div className="flex justify-between">
                          <span>Initial Bet ({watchedData.initialOutcome ? 'YES' : 'NO'}):</span>
                          <span>{watchedData.initialLiquidity || 0} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Market Creation Fee:</span>
                          <span>0.001 ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Gas Fees:</span>
                          <span>~0.002 ETH</span>
                        </div>
                        <div className="flex justify-between font-medium border-t border-blue-300 pt-1">
                          <span>Total Cost:</span>
                          <span>~{((watchedData.initialLiquidity || 0) + 0.003).toFixed(4)} ETH</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resolution Criteria Summary */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Resolution Criteria</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm">
                      {watchedData.resolutionCriteria || 'Resolution criteria not set...'}
                    </p>
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
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Deploying to Blockchain</h2>
                  <p className="text-gray-600 mb-6">
                    Your prediction market is being deployed to the Zora blockchain...
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Validating market parameters</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Deploying smart contract</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-gray-400">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      <span>Confirming transaction</span>
                    </div>
                  </div>
                </div>
              )}

              {deploymentStatus === 'success' && (
                <div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Market Deployed Successfully! 🎉</h2>
                  <p className="text-gray-600 mb-6">
                    Your prediction market has been deployed to the Zora blockchain and is now live.
                  </p>
                  {deploymentTxHash && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-center space-x-2 text-green-800">
                        <ExternalLink className="w-4 h-4" />
                        <a
                          href={`https://sepolia.explorer.zora.energy/tx/${deploymentTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline"
                        >
                          View Transaction: {deploymentTxHash.slice(0, 10)}...
                        </a>
                      </div>
                    </div>
                  )}
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
                  <p className="text-gray-600 mb-4">
                    There was an error deploying your market to the blockchain.
                  </p>
                  {deploymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-700 text-sm">{deploymentError}</p>
                    </div>
                  )}
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setCurrentStep('preview')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Back to Preview
                    </button>
                    <button
                      onClick={() => deployMarket(watchedData as MarketFormData)}
                      disabled={isDeploying}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
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
                  <span>Deploy to Blockchain</span>
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}