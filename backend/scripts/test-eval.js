const axios = require('axios');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:4000';

const payload = 
  {
  "original": {
    "sections": [
      {
        "title": "Programming Fundamentals",
        "questions": [
          {
            "id": "pf_001",
            "question": "What is Big O notation and why is it important?",
            "answer": "Big O notation describes the upper bound of an algorithm's time or space complexity as input size approaches infinity. It helps compare algorithm efficiency and scalability by focusing on the dominant term and ignoring constants and lower-order terms."
          },
          {
            "id": "pf_002",
            "question": "Explain the difference between pass-by-value and pass-by-reference.",
            "answer": "Pass-by-value creates a copy of the variable's value, so modifications inside the function don't affect the original variable. Pass-by-reference passes the memory address, allowing the function to modify the original variable. Pass-by-value is safer but less memory efficient for large data structures."
          }
        ]
      },
      {
        "title": "Data Structures",
        "questions": [
          {
            "id": "ds_001",
            "question": "What is a binary search tree and what are its properties?",
            "answer": "A binary search tree (BST) is a hierarchical data structure where each node has at most two children. The left subtree contains values less than the parent node, and the right subtree contains values greater than the parent node. This property enables efficient searching, insertion, and deletion with O(log n) average time complexity."
          },
          {
            "id": "ds_002",
            "question": "When would you use a hash table over an array?",
            "answer": "Use hash tables when you need fast key-based lookups (O(1) average), don't need ordered data, have sparse or non-integer keys, or need to implement sets/dictionaries. Use arrays when you need indexed access, ordered data, better memory locality, or when dealing with dense integer indices."
          }
        ]
      }
    ]
  },
  "questions": [
    {
      "questionId": "pf_001",
      "questionText": "What is Big O notation and why is it important?",
      "referenceAnswer": "Big O notation describes the upper bound of an algorithm's time or space complexity as input size approaches infinity. It helps compare algorithm efficiency and scalability by focusing on the dominant term and ignoring constants and lower-order terms.",
      "studentAnswer": "Big O notation describes the worst-case time and space complexity of algorithms as input size grows to infinity. It's crucial for algorithm analysis because it allows us to compare efficiency and scalability by focusing on the most significant term while ignoring constants and lower-order terms. For example, O(n²) algorithms scale poorly compared to O(n log n) algorithms for large datasets. It helps developers choose the right algorithm for performance-critical applications and predict how algorithms will behave with larger inputs."
    },
    {
      "questionId": "pf_002",
      "questionText": "Explain the difference between pass-by-value and pass-by-reference.",
      "referenceAnswer": "Pass-by-value creates a copy of the variable's value, so modifications inside the function don't affect the original variable. Pass-by-reference passes the memory address, allowing the function to modify the original variable. Pass-by-value is safer but less memory efficient for large data structures.",
      "studentAnswer": "Pass-by-value creates a copy of the argument's value and passes it to the function. Any modifications made inside the function only affect the copy, leaving the original variable unchanged. This provides safety against unintended side effects but uses more memory for large objects. Pass-by-reference passes the actual memory address of the variable, allowing the function to directly access and modify the original data. This is more memory efficient for large data structures but requires careful handling to avoid unintended mutations. Languages like C++ support both explicitly, while Java uses pass-by-value for primitives and pass-by-reference semantics for objects."
    },
    {
      "questionId": "ds_001",
      "questionText": "What is a binary search tree and what are its properties?",
      "referenceAnswer": "A binary search tree (BST) is a hierarchical data structure where each node has at most two children. The left subtree contains values less than the parent node, and the right subtree contains values greater than the parent node. This property enables efficient searching, insertion, and deletion with O(log n) average time complexity.",
      "studentAnswer": "A binary search tree is a specialized binary tree data structure that maintains a specific ordering property: for every node, all values in the left subtree are less than the node's value, and all values in the right subtree are greater than the node's value. This invariant enables efficient operations with O(log n) average time complexity for search, insertion, and deletion in balanced trees. Key properties include: each node has at most two children, in-order traversal produces sorted sequence, and the tree can become unbalanced (worst case O(n)) without proper balancing techniques like AVL or Red-Black tree implementations."
    },
    {
      "questionId": "ds_002",
      "questionText": "When would you use a hash table over an array?",
      "referenceAnswer": "Use hash tables when you need fast key-based lookups (O(1) average), don't need ordered data, have sparse or non-integer keys, or need to implement sets/dictionaries. Use arrays when you need indexed access, ordered data, better memory locality, or when dealing with dense integer indices.",
      "studentAnswer": "Hash tables are preferred when you need constant-time O(1) average lookups based on arbitrary keys (strings, objects), implementing associative data structures like dictionaries or sets, handling sparse data where most indices would be empty in an array, or when key-based access patterns are more natural than positional access. Arrays are better when you need guaranteed O(1) indexed access, maintain insertion order, require cache-friendly memory locality, iterate through all elements frequently, or work with dense numerical data where indices are consecutive integers. Hash tables trade memory overhead and potential collision handling complexity for flexible key-based access patterns."
    }
  ]
};

(async () => {
  try {
    console.log(`Posting sample evaluation payload to ${BACKEND_URL}/evaluate`);
    const res = await axios.post(`${BACKEND_URL}/evaluate`, payload, { timeout: 60000, headers: { 'Content-Type': 'application/json' } });
    console.log('Response status:', res.status);
    console.log('Response data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', JSON.stringify(err.response.data, null, 2));
      process.exit(1);
    }
    console.error('Request failed:', err.message || err);
    process.exit(2);
  }
})();
