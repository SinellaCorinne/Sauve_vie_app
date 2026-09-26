import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  FlatList,
  Animated,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'urgency',
    icon: '🚨',
    title: 'Répondez en temps réel',
    subtitle: 'Chaque minute compte. Recevez les alertes de sang compatibles et sauvez des vies instantanément.',
    image: require('../../assets/Blood donation-amico.png'),
    accent: Colors.primary,
    bg: Colors.primarySoft,
  },
  {
    key: 'compatibility',
    icon: '🩸',
    title: 'Groupes sanguins compatibles',
    subtitle: 'Notre système intelligent vous connecte aux demandes qui correspondent exactement à votre profil.',
    image: require('../../assets/Blood donation-bro.png'),
    accent: '#8E44AD',
    bg: '#F9F0FF',
  },
  {
    key: 'impact',
    icon: '💪',
    title: 'Un geste, mille vies',
    subtitle: "Rejoignez des milliers de donneurs et d'hôpitaux qui font confiance à Sauve-Vie chaque jour.",
    image: require('../../assets/Blood donation-pana.png'),
    accent: '#27AE60',
    bg: '#F0FDF4',
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate('RoleChoice');
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { backgroundColor: item.bg }]}>
            {/* Illustration */}
            <View style={[styles.imageContainer, { backgroundColor: item.accent + '12' }]}>
              <Image source={item.image} style={styles.illustration} resizeMode="contain" />
            </View>

            {/* Contenu */}
            <View style={styles.slideContent}>
              <View style={[styles.iconCircle, { backgroundColor: item.accent + '15' }]}>
                <Text style={styles.slideIcon}>{item.icon}</Text>
              </View>
              <Text style={[styles.slideTitle, { color: Colors.textDark }]}>{item.title}</Text>
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Contrôles bas */}
      <SafeAreaView style={styles.footer}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: SLIDES[currentIndex].accent }]}
              />
            );
          })}
        </View>

        {/* Boutons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('RoleChoice')}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: SLIDES[currentIndex].accent }]}
            onPress={goNext}
            activeOpacity={0.85}
          >
            <Text style={styles.nextText}>{isLast ? 'Commencer →' : 'Suivant →'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Slide
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    paddingBottom: 16,
  },
  imageContainer: {
    width: width,
    height: height * 0.42,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  illustration: {
    width: width * 0.82,
    height: height * 0.38,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 28,
    gap: 12,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideIcon: {
    fontSize: 26,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
    fontWeight: '400',
    maxWidth: 300,
  },

  // Footer
  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  nextButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.2,
  },
});
