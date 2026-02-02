import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useValentine, Photo, AIIllustration } from '@/hooks/useValentine';
import { FloatingHearts } from '@/components/animations/FloatingHearts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';

export const CreatorDashboard: React.FC = () => {
  const { signOut, user } = useAuth();
  const { 
    valentine, 
    loading, 
    uploadPhoto, 
    removePhoto, 
    updateLoveMessage, 
    updateViewerEmail,
    updateAIIllustration,
    deleteValentine 
  } = useValentine();
  
  const [activeTab, setActiveTab] = useState<'photos' | 'message' | 'ai' | 'settings'>('photos');
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [message, setMessage] = useState(valentine?.loveMessage || '');
  const [showMessage, setShowMessage] = useState(valentine?.showLoveMessage || false);
  const [viewerEmail, setViewerEmailInput] = useState(valentine?.viewerEmail || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [aiSettings, setAiSettings] = useState<AIIllustration>({
    scene: 'date',
    mood: 'cute',
    colorTheme: 'pink'
  });

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadPhoto(file, caption);
      }
      setCaption('');
      toast.success('Photos uploaded! 📸💕');
    } catch (error) {
      toast.error('Oops! Upload failed 🥺');
    } finally {
      setUploading(false);
    }
  }, [caption, uploadPhoto]);

  const handleSaveMessage = async () => {
    try {
      await updateLoveMessage(message, showMessage);
      toast.success('Love message saved! 💌');
    } catch (error) {
      toast.error('Failed to save message 🥺');
    }
  };

  const handleSaveViewerEmail = async () => {
    try {
      await updateViewerEmail(viewerEmail);
      toast.success('Viewer email saved! 💕');
    } catch (error) {
      toast.error('Failed to save email 🥺');
    }
  };

  const handleSaveAI = async () => {
    try {
      await updateAIIllustration(aiSettings);
      toast.success('AI illustration settings saved! 🎨✨');
    } catch (error) {
      toast.error('Failed to save settings 🥺');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteValentine();
      toast.success('Valentine deleted 💔');
      await signOut();
    } catch (error) {
      toast.error('Failed to delete 🥺');
    }
  };

  const daysRemaining = valentine?.expiryDate 
    ? differenceInDays(new Date(valentine.expiryDate), new Date())
    : 30;

  if (loading) {
    return (
      <div className="min-h-screen gradient-dream flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-6xl"
        >
          💖
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'photos', label: '📸 Photos', emoji: '🖼️' },
    { id: 'message', label: '💌 Message', emoji: '💝' },
    { id: 'ai', label: '🎨 AI Art', emoji: '✨' },
    { id: 'settings', label: '⚙️ Settings', emoji: '🔧' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingHearts count={10} />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.h1 
            className="text-2xl font-bold text-gradient-love"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💝 Creator Dashboard
          </motion.h1>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">
              {user?.email}
            </span>
            <Button
              onClick={signOut}
              variant="ghost"
              className="rounded-xl hover:bg-primary/10"
            >
              Sign out 👋
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Viewer Email Setup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-6 mb-8 shadow-soft border border-primary/20"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            💌 Who is this surprise for?
          </h2>
          <div className="flex gap-4 flex-col sm:flex-row">
            <Input
              type="email"
              value={viewerEmail}
              onChange={(e) => setViewerEmailInput(e.target.value)}
              placeholder="Their email address 💕"
              className="flex-1 rounded-xl"
            />
            <Button 
              onClick={handleSaveViewerEmail}
              className="rounded-xl gradient-love text-primary-foreground"
            >
              Save 💝
            </Button>
          </div>
          {valentine?.viewerEmail && (
            <p className="text-sm text-muted-foreground mt-2">
              ✨ {valentine.viewerEmail} can view your surprise!
            </p>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-2xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'gradient-love text-primary-foreground shadow-glow' 
                  : 'bg-card hover:bg-muted border border-border'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Upload Section */}
              <div className="bg-card rounded-3xl p-6 shadow-soft border border-border">
                <h3 className="text-lg font-bold mb-4">📸 Upload Photos</h3>
                
                <div className="space-y-4">
                  <Input
                    placeholder="Add a cute caption 💕"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="rounded-xl"
                  />
                  
                  <label className="block">
                    <motion.div
                      className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-4xl mb-2">
                        {uploading ? '⏳' : '📷'}
                      </div>
                      <p className="text-muted-foreground">
                        {uploading ? 'Uploading...' : 'Click or drag photos here ✨'}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </motion.div>
                  </label>
                </div>
              </div>

              {/* Photos Grid */}
              {valentine?.photos && valentine.photos.length > 0 && (
                <div className="bg-card rounded-3xl p-6 shadow-soft border border-border">
                  <h3 className="text-lg font-bold mb-4">🖼️ Your Photos ({valentine.photos.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {valentine.photos.map((photo: Photo) => (
                      <motion.div
                        key={photo.id}
                        className="relative group rounded-2xl overflow-hidden aspect-square"
                        whileHover={{ scale: 1.05 }}
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-white text-sm truncate">{photo.caption}</p>
                          </div>
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                          >
                            ✕
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'message' && (
            <motion.div
              key="message"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-3xl p-6 shadow-soft border border-border"
            >
              <h3 className="text-lg font-bold mb-4">💖 Write a Love Message</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMessage}
                    onChange={(e) => setShowMessage(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary"
                  />
                  <span>Show message to viewer 💕</span>
                </label>
              </div>

              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write something straight from your heart 💕..."
                className="min-h-[200px] rounded-xl font-handwritten text-lg"
              />
              
              <Button
                onClick={handleSaveMessage}
                className="mt-4 rounded-xl gradient-love text-primary-foreground"
              >
                Save Message 💌
              </Button>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-3xl p-6 shadow-soft border border-border"
            >
              <h3 className="text-lg font-bold mb-4">🎨 AI Dreamy Illustration</h3>
              <p className="text-muted-foreground mb-6">
                Create a magical artistic scene ✨ (No real photos used)
              </p>
              
              <div className="space-y-6">
                {/* Scene Selection */}
                <div>
                  <label className="block font-medium mb-3">Choose a Scene 🎭</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'proposal', emoji: '💍', label: 'Proposal' },
                      { id: 'date', emoji: '☕', label: 'Cute Date' },
                      { id: 'stars', emoji: '🌙', label: 'Under Stars' },
                    ].map((scene) => (
                      <motion.button
                        key={scene.id}
                        onClick={() => setAiSettings(prev => ({ ...prev, scene: scene.id as any }))}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          aiSettings.scene === scene.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-3xl mb-2">{scene.emoji}</div>
                        <div className="text-sm font-medium">{scene.label}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Mood Selection */}
                <div>
                  <label className="block font-medium mb-3">Mood 💫</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'cute', emoji: '🥰', label: 'Cute' },
                      { id: 'emotional', emoji: '🥹', label: 'Emotional' },
                      { id: 'magical', emoji: '✨', label: 'Magical' },
                    ].map((mood) => (
                      <motion.button
                        key={mood.id}
                        onClick={() => setAiSettings(prev => ({ ...prev, mood: mood.id as any }))}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          aiSettings.mood === mood.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-3xl mb-2">{mood.emoji}</div>
                        <div className="text-sm font-medium">{mood.label}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Color Theme */}
                <div>
                  <label className="block font-medium mb-3">Color Theme 🎨</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'pink', label: 'Pastel Pink', color: 'bg-pink-300' },
                      { id: 'lavender', label: 'Lavender', color: 'bg-purple-300' },
                      { id: 'gold', label: 'Sunset Gold', color: 'bg-amber-300' },
                    ].map((theme) => (
                      <motion.button
                        key={theme.id}
                        onClick={() => setAiSettings(prev => ({ ...prev, colorTheme: theme.id as any }))}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          aiSettings.colorTheme === theme.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`w-10 h-10 rounded-full ${theme.color} mx-auto mb-2`} />
                        <div className="text-sm font-medium">{theme.label}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSaveAI}
                  className="w-full rounded-xl gradient-love text-primary-foreground"
                >
                  Save AI Settings ✨
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Expiry Info */}
              <div className="bg-card rounded-3xl p-6 shadow-soft border border-border">
                <h3 className="text-lg font-bold mb-4">⏰ Auto-Expiry</h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">⏳</div>
                  <div>
                    <p className="font-medium">
                      This love story will gently fade in{' '}
                      <span className="text-primary font-bold">{daysRemaining} days</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Content auto-deletes for privacy 💕
                    </p>
                  </div>
                </div>
              </div>

              {/* Reactions */}
              {valentine?.reactions && valentine.reactions.length > 0 && (
                <div className="bg-card rounded-3xl p-6 shadow-soft border border-border">
                  <h3 className="text-lg font-bold mb-4">🥰 Viewer Reactions</h3>
                  <div className="flex gap-4 flex-wrap">
                    {valentine.reactions.map((reaction, idx) => (
                      <motion.div
                        key={idx}
                        className="px-4 py-2 rounded-full bg-primary/10 text-primary"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        {reaction.type === 'love' && '❤️ Love this'}
                        {reaction.type === 'emotional' && '🥹 Emotional'}
                        {reaction.type === 'cute' && '😆 Cute'}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Delete */}
              <div className="bg-destructive/10 rounded-3xl p-6 border border-destructive/30">
                <h3 className="text-lg font-bold mb-4 text-destructive flex items-center gap-2">
                  🚨 Emergency Delete
                </h3>
                <p className="text-muted-foreground mb-4">
                  This will permanently delete everything - photos, messages, and viewer access.
                </p>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="destructive"
                  className="rounded-xl"
                >
                  Delete Everything 💔
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-3xl p-8 max-w-md w-full shadow-float"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">💔</div>
                <h3 className="text-xl font-bold mb-2">Are you sure?</h3>
                <p className="text-muted-foreground mb-6">
                  This will permanently delete everything. This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1 rounded-xl"
                  >
                    Nevermind 💕
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    className="flex-1 rounded-xl"
                  >
                    Delete 💔
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
