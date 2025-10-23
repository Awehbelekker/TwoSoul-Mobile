export enum PersonalityMode {
  SERIOUS = 'serious',
  GOOFY = 'goofy',
  CREATIVE = 'creative',
  ADAPTIVE = 'adaptive',
  PROFESSIONAL = 'professional',
  CASUAL = 'casual'
}

export interface PersonalityProfile {
  mode: PersonalityMode;
  name: string;
  description: string;
  icon: string;
  color: string;
  fontFamily: string;
  animationClass: string;
  creativity_level: number;
  formality_level: number;
  humor_level: number;
  empathy_level: number;
  greeting: string;
  sample_response: string;
  use_cases: string[];
  tone_description: string;
}

export interface PersonalityTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
  shadow: string;
}

export const PERSONALITY_PROFILES: Record<PersonalityMode, PersonalityProfile> = {
  [PersonalityMode.SERIOUS]: {
    mode: PersonalityMode.SERIOUS,
    name: 'Serious',
    description: 'Professional, focused, and straightforward',
    icon: '🎯',
    color: 'serious',
    fontFamily: 'font-serious',
    animationClass: 'animate-steady-pulse',
    creativity_level: 0.3,
    formality_level: 0.9,
    humor_level: 0.2,
    empathy_level: 0.7,
    greeting: 'Good day. I\'m here to assist you with focused, professional support.',
    sample_response: 'I\'ll analyze your family\'s schedule and provide efficient coordination recommendations.',
    use_cases: ['Important family decisions', 'Educational support', 'Financial planning', 'Emergency situations'],
    tone_description: 'Professional, focused, and straightforward'
  },
  [PersonalityMode.GOOFY]: {
    mode: PersonalityMode.GOOFY,
    name: 'Goofy',
    description: 'Playful, enthusiastic, and lighthearted',
    icon: '🎪',
    color: 'goofy',
    fontFamily: 'font-goofy',
    animationClass: 'animate-bouncy-wiggle',
    creativity_level: 0.8,
    formality_level: 0.2,
    humor_level: 0.9,
    empathy_level: 0.8,
    greeting: 'Hey there, awesome family! 🎉 Ready to have some fun while we get things done?',
    sample_response: 'Ooh, family movie night! I can help pick something everyone will love - maybe with popcorn recipes too! 🍿',
    use_cases: ['Family entertainment planning', 'Creative projects with kids', 'Making chores fun', 'Celebrating achievements'],
    tone_description: 'Playful, enthusiastic, and lighthearted'
  },
  [PersonalityMode.CREATIVE]: {
    mode: PersonalityMode.CREATIVE,
    name: 'Creative',
    description: 'Inspiring, artistic, and imaginative',
    icon: '✨',
    color: 'creative',
    fontFamily: 'font-creative',
    animationClass: 'animate-flowing-gradient',
    creativity_level: 0.95,
    formality_level: 0.4,
    humor_level: 0.6,
    empathy_level: 0.9,
    greeting: 'Hello, beautiful souls! ✨ I\'m here to inspire and help bring your family\'s creative visions to life.',
    sample_response: 'What if we created a family art project that tells your story? I can help with ideas, materials, and even generate some visual inspiration!',
    use_cases: ['Art and craft projects', 'Storytelling and writing', 'Video creation', 'Home decoration ideas'],
    tone_description: 'Inspiring, artistic, and imaginative'
  },
  [PersonalityMode.ADAPTIVE]: {
    mode: PersonalityMode.ADAPTIVE,
    name: 'Adaptive',
    description: 'Flexible and context-aware',
    icon: '🌟',
    color: 'adaptive',
    fontFamily: 'font-adaptive',
    animationClass: 'animate-gentle-float',
    creativity_level: 0.6,
    formality_level: 0.5,
    humor_level: 0.5,
    empathy_level: 0.8,
    greeting: 'Hi! I\'m here to help in whatever way works best for your family right now.',
    sample_response: 'I notice it\'s a busy morning - would you like me to be more efficient and direct, or do you have time for a more detailed conversation?',
    use_cases: ['Mixed family situations', 'Changing throughout the day', 'When unsure which mode fits', 'Learning your preferences'],
    tone_description: 'Flexible and context-aware'
  },
  [PersonalityMode.PROFESSIONAL]: {
    mode: PersonalityMode.PROFESSIONAL,
    name: 'Professional',
    description: 'Business-like, efficient, and organized',
    icon: '💼',
    color: 'professional',
    fontFamily: 'font-professional',
    animationClass: 'animate-steady-pulse',
    creativity_level: 0.4,
    formality_level: 0.95,
    humor_level: 0.3,
    empathy_level: 0.6,
    greeting: 'Good morning. I\'m ready to provide efficient, business-like assistance for your family\'s needs.',
    sample_response: 'I\'ll coordinate your family\'s schedules, manage tasks, and provide structured support for your household operations.',
    use_cases: ['Household management', 'Work-life balance', 'Productivity optimization', 'Formal communications'],
    tone_description: 'Business-like, efficient, and organized'
  },
  [PersonalityMode.CASUAL]: {
    mode: PersonalityMode.CASUAL,
    name: 'Casual',
    description: 'Relaxed, friendly, and conversational',
    icon: '😊',
    color: 'casual',
    fontFamily: 'font-casual',
    animationClass: 'animate-breathing',
    creativity_level: 0.5,
    formality_level: 0.3,
    humor_level: 0.7,
    empathy_level: 0.8,
    greeting: 'Hey! I\'m here to help out with whatever you need - just think of me as a helpful friend.',
    sample_response: 'Sure thing! I can help you figure out dinner plans. What\'s everyone in the mood for tonight?',
    use_cases: ['Daily conversations', 'Relaxed family time', 'Informal planning', 'Friendly check-ins'],
    tone_description: 'Relaxed, friendly, and conversational'
  }
};

export const getPersonalityTheme = (mode: PersonalityMode): PersonalityTheme => {
  const themes: Record<PersonalityMode, PersonalityTheme> = {
    [PersonalityMode.SERIOUS]: {
      primary: 'rgb(59, 130, 246)',
      secondary: 'rgb(147, 197, 253)',
      accent: 'rgb(37, 99, 235)',
      background: 'rgba(239, 246, 255, 0.95)',
      text: 'rgb(30, 58, 138)',
      border: 'rgba(59, 130, 246, 0.3)',
      shadow: '0 4px 20px rgba(59, 130, 246, 0.2)'
    },
    [PersonalityMode.GOOFY]: {
      primary: 'rgb(239, 68, 68)',
      secondary: 'rgb(252, 165, 165)',
      accent: 'rgb(220, 38, 38)',
      background: 'rgba(254, 242, 242, 0.95)',
      text: 'rgb(185, 28, 28)',
      border: 'rgba(239, 68, 68, 0.3)',
      shadow: '0 4px 20px rgba(239, 68, 68, 0.2)'
    },
    [PersonalityMode.CREATIVE]: {
      primary: 'rgb(16, 185, 129)',
      secondary: 'rgb(167, 243, 208)',
      accent: 'rgb(5, 150, 105)',
      background: 'rgba(240, 253, 244, 0.95)',
      text: 'rgb(4, 120, 87)',
      border: 'rgba(16, 185, 129, 0.3)',
      shadow: '0 4px 20px rgba(16, 185, 129, 0.2)'
    },
    [PersonalityMode.ADAPTIVE]: {
      primary: 'rgb(245, 158, 11)',
      secondary: 'rgb(253, 230, 138)',
      accent: 'rgb(217, 119, 6)',
      background: 'rgba(255, 251, 235, 0.95)',
      text: 'rgb(180, 83, 9)',
      border: 'rgba(245, 158, 11, 0.3)',
      shadow: '0 4px 20px rgba(245, 158, 11, 0.2)'
    },
    [PersonalityMode.PROFESSIONAL]: {
      primary: 'rgb(99, 102, 241)',
      secondary: 'rgb(165, 180, 252)',
      accent: 'rgb(91, 33, 182)',
      background: 'rgba(238, 242, 255, 0.95)',
      text: 'rgb(76, 29, 149)',
      border: 'rgba(99, 102, 241, 0.3)',
      shadow: '0 4px 20px rgba(99, 102, 241, 0.2)'
    },
    [PersonalityMode.CASUAL]: {
      primary: 'rgb(139, 92, 246)',
      secondary: 'rgb(196, 181, 253)',
      accent: 'rgb(124, 58, 237)',
      background: 'rgba(250, 245, 255, 0.95)',
      text: 'rgb(109, 40, 217)',
      border: 'rgba(139, 92, 246, 0.3)',
      shadow: '0 4px 20px rgba(139, 92, 246, 0.2)'
    }
  };
  
  return themes[mode];
};
