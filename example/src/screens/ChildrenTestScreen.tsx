/**
 * Children Test Screen
 *
 * Tests whether NitroView properly renders children.
 */

import * as React from 'react'
import { StyleSheet, View, Text, Button, ScrollView } from 'react-native'
import { callback } from 'react-native-nitro-modules'
import { TestView } from 'react-native-nitro-test'

export function ChildrenTestScreen() {
  const [showTest, setShowTest] = React.useState(false)

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
})
