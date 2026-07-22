/**
 * Children Test Screen
 *
 * Tests whether NitroView properly renders children.
 */

import * as React from 'react'
import { StyleSheet, View, Text, Button, ScrollView, TouchableOpacity, FlatList, Animated } from 'react-native'
import { callback } from 'react-native-nitro-modules'
import { TestView } from 'react-native-nitro-test'

export function ChildrenTestScreen() {
  const [showTest, setShowTest] = React.useState(false)
  const [pressCount, setPressCount] = React.useState(0)
  const [dynamicVisible, setDynamicVisible] = React.useState(true)
  const animatedValue = React.useRef(new Animated.Value(0)).current

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>NitroView Children Rendering Test</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test 1: Simple Text Child</Text>
        <Text style={styles.description}>
          Expected: Red box with "Hello from children" text inside
        </Text>
        {showTest && (
          <TestView
            style={styles.testView}
            isBlue={false}
            hasBeenCalled={false}
            colorScheme="light"
            someCallback={callback(() => console.log('callback'))}
          >
            <Text style={styles.childText}>Hello from children!</Text>
          </TestView>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test 2: Multiple Children</Text>
        <Text style={styles.description}>
          Expected: Multiple text lines rendered inside the view
        </Text>
        {showTest && (
          <TestView
            style={styles.testView}
            isBlue={true}
            hasBeenCalled={false}
            colorScheme="dark"
            someCallback={callback(() => console.log('callback'))}
          >
            <Text style={styles.childText}>Line 1</Text>
            <Text style={styles.childText}>Line 2</Text>
            <Text style={styles.childText}>Line 3</Text>
          </TestView>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test 3: Nested Views</Text>
        <Text style={styles.description}>
          Expected: Nested structure with multiple levels rendered
        </Text>
        {showTest && (
          <TestView
            style={styles.testView}
            isBlue={false}
            hasBeenCalled={false}
            colorScheme="light"
            someCallback={callback(() => console.log('callback'))}
          >
            <View style={styles.nestedContainer}>
              <Text style={styles.childText}>Parent level</Text>
              <View style={styles.nested}>
                <Text style={styles.childText}>Nested level</Text>
              </View>
            </View>
          </TestView>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test 4: Styled Children</Text>
        <Text style={styles.description}>
          Expected: Text with different colors and sizes inside view
        </Text>
        {showTest && (
          <TestView
            style={styles.testView}
            isBlue={true}
            hasBeenCalled={false}
            colorScheme="light"
            someCallback={callback(() => console.log('callback'))}
          >
            <Text style={[styles.childText, { color: '#FF0000', fontSize: 18 }]}>Red Large</Text>
            <Text style={[styles.childText, { color: '#00AA00', fontSize: 12 }]}>Green Small</Text>
            <Text style={[styles.childText, { color: '#0000FF', fontWeight: 'bold' }]}>Blue Bold</Text>
          </TestView>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test 5: Interactive Children</Text>
        <Text style={styles.description}>
          Expected: Pressable button inside that increments counter. Current: {pressCount}
        </Text>
        {showTest && (
          <TestView
            style={styles.testView}
            isBlue={false}
            hasBeenCalled={false}
            colorScheme="dark"
            someCallback={callback(() => console.log('callback'))}
          >
            <TouchableOpacity
              style={styles.interactiveButton}
              onPress={() => setPressCount(pressCount + 1)}
            >
              <Text style={styles.buttonText}>Press me ({pressCount})</Text>
            </TouchableOpacity>
          </TestView>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test 6: Mixed Content Types</Text>
        <Text style={styles.description}>
          Expected: Text, button, and styled view all inside one NitroView
        </Text>
        {showTest && (
          <TestView
            style={[styles.testView, { height: 150 }]}
            isBlue={true}
            hasBeenCalled={false}
            colorScheme="light"
            someCallback={callback(() => console.log('callback'))}
          >
            <Text style={styles.childText}>Plain Text</Text>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.smallButton}>
              <Text style={[styles.buttonText, { fontSize: 12 }]}>Tap</Text>
            </TouchableOpacity>
            <View style={styles.coloredBox} />
          </TestView>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test 7: Dynamic Visibility</Text>
        <Text style={styles.description}>
          Expected: Text appears/disappears when you toggle below
        </Text>
        <Button
          title={dynamicVisible ? 'Hide Child' : 'Show Child'}
          onPress={() => setDynamicVisible(!dynamicVisible)}
          color="#FF9500"
        />
        {showTest && (
          <TestView
            style={styles.testView}
            isBlue={false}
            hasBeenCalled={false}
            colorScheme="light"
            someCallback={callback(() => console.log('callback'))}
          >
            {dynamicVisible ? (
              <Text style={[styles.childText, { color: '#FF0000' }]}>I am visible!</Text>
            ) : (
              <Text style={[styles.childText, { color: '#999' }]}>I am hidden</Text>
            )}
          </TestView>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test 8: Complex Nested Structure</Text>
        <Text style={styles.description}>
          Expected: Multiple nested levels with mixed content types
        </Text>
        {showTest && (
          <TestView
            style={[styles.testView, { height: 180 }]}
            isBlue={true}
            hasBeenCalled={false}
            colorScheme="dark"
            someCallback={callback(() => console.log('callback'))}
          >
            <View style={styles.complexContainer}>
              <View style={styles.row}>
                <Text style={styles.label}>Left</Text>
                <Text style={styles.label}>Right</Text>
              </View>
              <View style={[styles.row, { marginTop: 8 }]}>
                <View style={styles.box} />
                <View style={[styles.box, { backgroundColor: '#FF00FF' }]} />
              </View>
              <Text style={[styles.childText, { marginTop: 8 }]}>Bottom Text</Text>
            </View>
          </TestView>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test 9: Many Children (10+)</Text>
        <Text style={styles.description}>
          Expected: Many text items rendered inside one view
        </Text>
        {showTest && (
          <TestView
            style={[styles.testView, { height: 200, justifyContent: 'flex-start' }]}
            isBlue={false}
            hasBeenCalled={false}
            colorScheme="light"
            someCallback={callback(() => console.log('callback'))}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <Text key={i} style={[styles.childText, { fontSize: 11, marginVertical: 2 }]}>
                Item {i + 1}
              </Text>
            ))}
          </TestView>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={showTest ? 'Hide Tests' : 'Show Tests'}
          onPress={() => setShowTest(!showTest)}
          color="#007AFF"
        />
      </View>

      <View style={styles.resultSection}>
        <Text style={styles.resultTitle}>Result</Text>
        {showTest ? (
          <View>
            <Text style={styles.passing}>
              ✅ If you see text inside colored boxes above, children rendering
              is working!
            </Text>
            <Text style={styles.info}>
              If you see empty boxes, the fix hasn't been applied to iOS yet.
            </Text>
          </View>
        ) : (
          <Text style={styles.info}>Click "Show Tests" to run the tests</Text>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    color: '#333',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  testView: {
    height: 100,
    marginVertical: 10,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  childText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  nestedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nested: {
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    marginVertical: 20,
  },
  resultSection: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 40,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  passing: {
    fontSize: 14,
    color: '#00aa00',
    marginBottom: 8,
  },
  info: {
    fontSize: 13,
    color: '#666',
  },
  interactiveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 8,
  },
  smallButton: {
    backgroundColor: '#34C759',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'center',
  },
  coloredBox: {
    width: 40,
    height: 40,
    backgroundColor: '#FF3B30',
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'center',
  },
  complexContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  box: {
    width: 35,
    height: 35,
    backgroundColor: '#00AA00',
    borderRadius: 2,
  },
})
