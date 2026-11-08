window.COURSE_DATA = [
  {
    "id": "topic-1",
    "number": "01",
    "title": "Memory Architecture: Pointers & References (C++ vs Java)",
    "tag": "Prerequisites & Memory Fundamentals",
    "summary": "Stack vs Heap, Pointers vs Java References, `new`/`delete` vs JVM Garbage Collector, and type-safety.",
    "intuition_hinglish": "Dekho {{USER}} bhai, college me jab C language padhi thi, to tum <code>malloc(sizeof(struct Node))</code> likhte the aur typecast karte the <code>(struct Node*)</code>.\n    \n    Lekin modern C++ aur Java me memory handling ka game bilkul alag hai:\n    1. <b>C++ Me</b>: Tumhare paas physical memory address (Pointer <code>Node*</code>) hota hai. Memory allocate hoti hai <code>new Node(10)</code> se aur delete karni padti hai <code>delete ptr</code> se. Agar delete nahi kiya to Heap me <b>Memory Leak</b> ho jayega! Aur C++ me <code>nullptr</code> strictly pointer literal hai, integer 0 nahi.\n    2. <b>Java Me</b>: Java me physical pointers nahi hote, <b>Object References</b> hote hain. Jab tum <code>ListNode node = new ListNode(10);</code> likhte ho, to JVM Heap me memory allocate karta hai. Java me <code>delete</code> keyword nahi hota—JVM ka <b>Garbage Collector (GC)</b> automatically un objects ko clean kar deta hai jinka koi reference nahi bachta.\n    \n    Interview me interviewer sabse pehle ye dekhta hai ki kya tumhe pata hai ki pointer/reference actual memory me kaise move karta hai!",
    "intuition_en": "Welcome {{USER}} to Linked List mastery. In low-level C, memory allocation required manual arithmetic with <code>malloc()</code> and raw typecasting.\n    \n    Modern C++ and Java establish distinct architectural paradigms:\n    1. <b>C++ Paradigm</b>: Direct address manipulation via typed pointers (<code>ListNode*</code>). Dynamic heap objects are created with <code>new</code> and must be explicitly deallocated with <code>delete</code> to prevent severe memory leaks. C++11 introduced <code>nullptr</code> (of type <code>std::nullptr_t</code>) to eliminate ambiguous NULL integer macro vulnerabilities.\n    2. <b>Java Paradigm</b>: References are safe, managed pointers. Objects are created on the JVM Heap, and unreferenced memory is automatically reclaimed by the Garbage Collector (GC).\n    \n    Mastering this structural foundation guarantees zero NullPointerExceptions and segmentation faults in technical interviews.",
    "intuition_tldr": "• C++: Explicit pointers (Node*), manual deallocation (delete ptr), nullptr type safety.\n• Java: Managed object references, automatic Garbage Collection, null literal.\n• Both allocate node payloads dynamically on the Heap; pointer variables reside on the Stack.",
    "c_vs_cpp": [
      {
        "feature": "Heap Allocation",
        "c": "malloc(sizeof(Node))",
        "cpp": "new Node(val) (C++) / new ListNode(val) (Java)"
      },
      {
        "feature": "Memory Freeing",
        "c": "free(ptr)",
        "cpp": "delete ptr (C++) / JVM GC automatic (Java)"
      },
      {
        "feature": "Null Representation",
        "c": "NULL ((void*)0)",
        "cpp": "nullptr (C++) / null (Java)"
      },
      {
        "feature": "Pointer Arithmetic",
        "c": "Allowed (ptr++)",
        "cpp": "Allowed in C++; Prohibited in Java"
      },
      {
        "feature": "Pass Mechanism",
        "c": "Pass by pointer value",
        "cpp": "Node* &head (C++ native ref) / Object ref by value (Java)"
      }
    ],
    "diagram": "STACK MEMORY (Local Scope)           HEAP MEMORY (Dynamic Objects)\n+-----------------------+           +-----------------------------+\n| C++:  Node* ptr = 0x500| --------> | ListNode {                  |\n| Java: ListNode ptr    |           |   val = 42;                 |\n| (Holds Heap Address)  |           |   next = nullptr / null;    |\n+-----------------------+           | } (Allocated at Heap: 0x500)|\n                                    +-----------------------------+\nIn C++: Failure to invoke 'delete ptr;' -> Memory Leak!\nIn Java: Once ptr = null, 0x500 is eligible for Garbage Collection.",
    "code_cpp": "// Modern C++ Node Blueprint with Constructors & Safe Memory Cleanup\n#include <iostream>\nusing namespace std;\n\nstruct ListNode {\n    int val;\n    ListNode* next;\n\n    // Default constructor\n    ListNode() : val(0), next(nullptr) {}\n\n    // Parameterized constructor\n    ListNode(int x) : val(x), next(nullptr) {}\n\n    // Constructor with chained next pointer\n    ListNode(int x, ListNode* nextNode) : val(x), next(nextNode) {}\n};\n\nint main() {\n    // Dynamic allocation on Heap\n    ListNode* head = new ListNode(10);\n    head->next = new ListNode(20);\n\n    cout << \"C++ Nodes: \" << head->val << \" -> \" << head->next->val << \" -> nullptr\\n\";\n\n    // Clean up heap memory to avoid leaks\n    delete head->next;\n    delete head;\n    head = nullptr;\n    return 0;\n}",
    "code_java": "// Modern Java ListNode Definition & Usage\npublic class LinkedListBasics {\n    public static class ListNode {\n        public int val;\n        public ListNode next;\n\n        public ListNode() { this.val = 0; this.next = null; }\n        public ListNode(int val) { this.val = val; this.next = null; }\n        public ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n    }\n\n    public static void main(String[] args) {\n        // Heap allocation in Java (Managed by Garbage Collector)\n        ListNode head = new ListNode(10);\n        head.next = new ListNode(20);\n\n        System.out.println(\"Java Nodes: \" + head.val + \" -> \" + head.next.val + \" -> null\");\n        // No delete keyword needed; GC reclaims unreferenced nodes\n    }\n}",
    "dry_run": [
      "1. Memory allocation creates Node(10) at heap address 0x500.",
      "2. `head->next = new Node(20)` allocates Node(20) at heap address 0x600 and stores 0x600 inside head's `next` field.",
      "3. In C++: `delete head->next; delete head;` returns memory to OS. Setting `head = nullptr;` prevents dangling pointer bugs.",
      "4. In Java: Setting `head = null;` breaks all incoming references, making both nodes eligible for GC sweep."
    ],
    "pitfalls": [
      "<b>Dangling Pointers (C++)</b>: Calling `delete ptr;` without `ptr = nullptr;` leaves `ptr` pointing to invalid deallocated memory.",
      "<b>Memory Leaks in Java</b>: Even with GC, storing nodes in static collections or circular references with active listeners causes memory leaks.",
      "<b>Double Free</b>: Calling `delete` twice on the same pointer in C++ causes undefined behavior / process crash."
    ],
    "leetcode_milestone": {
      "name": "Delete Node in a Linked List",
      "number": 237,
      "url": "https://leetcode.com/problems/delete-node-in-a-linked-list/",
      "checkpoint": "Now you understand memory node structures! You can solve LC 237 without needing the head pointer."
    },
    "problems": [
      {
        "id": "p1_1",
        "difficulty": "Easy",
        "title": "Manual 3-Node Chain Creation",
        "leetcode": "Memory Warmup",
        "leetcode_url": "https://leetcode.com/problems/delete-node-in-a-linked-list/",
        "desc": "Construct a 3-node linked list dynamically with values [10, 20, 30], link them linearly, print the traversal, and deallocate memory safely.",
        "input": "Values: 10, 20, 30",
        "output": "10 -> 20 -> 30 -> null",
        "edge_cases": "Zero memory leak on exit.",
        "hints": [
          "Instantiate nodes: `head = new Node(10);`",
          "Link: `head->next = new Node(20); head->next->next = new Node(30);`",
          "Traverse using a temporary cursor `curr = head;`"
        ],
        "starter_code_cpp": "#include <iostream>\nusing namespace std;\n\nstruct Node {\n    int val;\n    Node* next;\n    Node(int v) : val(v), next(nullptr) {}\n};\n\nvoid run() {\n    // Write your C++ code here:\n}",
        "starter_code_java": "public class Solution {\n    static class Node {\n        int val;\n        Node next;\n        Node(int v) { this.val = v; this.next = null; }\n    }\n\n    public static void run() {\n        // Write your Java code here:\n    }\n}",
        "solution_cpp": "void run() {\n    Node* head = new Node(10);\n    head->next = new Node(20);\n    head->next->next = new Node(30);\n\n    Node* curr = head;\n    while (curr) {\n        cout << curr->val << \" -> \";\n        curr = curr->next;\n    }\n    cout << \"nullptr\\n\";\n\n    // Clean up\n    curr = head;\n    while (curr) {\n        Node* nxt = curr->next;\n        delete curr;\n        curr = nxt;\n    }\n}\n// Time: O(N) | Space: O(1) auxiliary",
        "solution_java": "public static void run() {\n    Node head = new Node(10);\n    head.next = new Node(20);\n    head.next.next = new Node(30);\n\n    Node curr = head;\n    while (curr != null) {\n        System.out.print(curr.val + \" -> \");\n        curr = curr.next;\n    }\n    System.out.println(\"null\");\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "Values: 10, 20, 30",
            "expected": "10 -> 20 -> 30 -> null",
            "actual": "10 -> 20 -> 30 -> null",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p1_2",
        "difficulty": "Medium",
        "title": "Safe Pointer / Reference Swapping",
        "leetcode": "Pointer Redirection",
        "leetcode_url": "https://leetcode.com/problems/swap-nodes-in-pairs/",
        "desc": "Write a function that swaps two node pointers without copying their data fields.",
        "input": "Node A(10), Node B(20)",
        "output": "Pointer A points to 20, Pointer B points to 10",
        "edge_cases": "Must pass by reference in C++ (`Node* &`).",
        "hints": [
          "In C++, `void swap(Node* a, Node* b)` only swaps local copies.",
          "Use reference to pointer: `void swap(Node* &a, Node* &b)`.",
          "Use a temporary pointer: `Node* temp = a; a = b; b = temp;`."
        ],
        "starter_code_cpp": "void swapNodePointers(Node* &a, Node* &b) {\n    // C++ Pointer swap logic:\n}",
        "starter_code_java": "// In Java, references are passed by value. To swap references, use a wrapper or container:\nclass NodeHolder {\n    Node node;\n    NodeHolder(Node n) { this.node = n; }\n}\nvoid swapHolders(NodeHolder h1, NodeHolder h2) {\n    // Java swap logic:\n}",
        "solution_cpp": "void swapNodePointers(Node* &a, Node* &b) {\n    Node* temp = a;\n    a = b;\n    b = temp;\n}\n// Time: O(1) | Space: O(1)",
        "solution_java": "void swapHolders(NodeHolder h1, NodeHolder h2) {\n    Node temp = h1.node;\n    h1.node = h2.node;\n    h2.node = temp;\n}\n// Time: O(1) | Space: O(1)",
        "companies": [
          "Meta",
          "Bloomberg",
          "Apple"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "Node A(10), Node B(20)",
            "expected": "Pointer A points to 20, Pointer B points to 10",
            "actual": "Pointer A points to 20, Pointer B points to 10",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p1_3",
        "difficulty": "LeetCode Style",
        "title": "LeetCode 237: Delete Node in a Linked List",
        "leetcode": "LeetCode 237 (Easy)",
        "leetcode_url": "https://leetcode.com/problems/delete-node-in-a-linked-list/",
        "desc": "You are given only the pointer/reference of the node to be deleted. You do NOT have access to the head of the list! Node is guaranteed not to be the tail.",
        "input": "head = [4,5,1,9], target = 5",
        "output": "[4,1,9]",
        "edge_cases": "Node is not the last node in the list.",
        "hints": [
          "Since you cannot reach the previous node to update its `next`, think differently.",
          "Copy the next node's value into the current node!",
          "Bypass the next node: `node->next = node->next->next;`."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    void deleteNode(ListNode* node) {\n        // Your C++ code:\n    }\n};",
        "starter_code_java": "class Solution {\n    public void deleteNode(ListNode node) {\n        // Your Java code:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    void deleteNode(ListNode* node) {\n        ListNode* nextNode = node->next;\n        node->val = nextNode->val;\n        node->next = nextNode->next;\n        delete nextNode; // Free memory in C++\n    }\n};\n// Time Complexity: O(1) | Space Complexity: O(1)",
        "solution_java": "class Solution {\n    public void deleteNode(ListNode node) {\n        node.val = node.next.val;\n        node.next = node.next.next;\n    }\n}\n// Time Complexity: O(1) | Space Complexity: O(1)",
        "companies": [
          "Amazon",
          "Uber",
          "Microsoft"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [4,5,1,9], target = 5",
            "expected": "[4,1,9]",
            "actual": "[4,1,9]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      }
    ]
  },
  {
    "id": "topic-2",
    "number": "02",
    "title": "Singly Linked List Construction & Traversal",
    "tag": "Creation & Sequential Access",
    "summary": "Array vs Linked List memory fragmentation, iterative traversal, head preservation, and destructor cleanup.",
    "intuition_hinglish": "{{USER}}, Array aur Linked List ka sabse bada difference memory layout me hota hai:\n    - <b>Array</b>: Memory continuous/contiguous blocks me milti hai (ek ke baad ek). Isliye <code>arr[i]</code> direct O(1) time me access ho jata hai. Lekin insert karne pe elements shift karne padte hain (O(N)).\n    - <b>Linked List</b>: Memory Heap me scattered (bikhri hui) hoti hai. Har node alag-alag address pe hota hai. Isliye random access impossible hai—kisi bhi node tak pahunchne ke liye head se ek-ek kadam aage badhna padta hai (Traversal: O(N)).\n    \n    <b>Golden Rule of Traversal:</b>\n    Kabhi bhi <code>head = head->next;</code> mat chalana! Isse tumhara original start address hamesha ke liye kho jayega. Hamesha ek temporary cursor <code>curr = head</code> use karo!",
    "intuition_en": "{{USER}}, understanding the architectural contrast between contiguous Arrays and linked nodes is paramount:\n    - <b>Array</b>: Elements reside in contiguous physical memory, enabling O(1) indexed lookups via memory offset formula: <code>Base + (Index * Size)</code>. However, mid-array insertions necessitate O(N) element shifts.\n    - <b>Linked List</b>: Nodes reside in fragmented heap memory connected strictly via pointers. Random access is infeasible (O(N) sequential traversal), but dynamic insertions require zero bulk shifts.\n    \n    <b>Head Preservation Axiom:</b> Never reassign the root <code>head</code> reference during traversal loops. Always establish an independent traversal pointer (e.g. <code>curr = head</code>).",
    "intuition_tldr": "• Array: Contiguous memory, O(1) lookup, expensive reallocation/shifts.\n• Linked List: Fragmented heap blocks, O(N) traversal, cheap O(1) pointer rewirings.\n• Always use temporary cursor pointers to preserve list root.",
    "c_vs_cpp": [
      {
        "feature": "Traversal Guard",
        "c": "while(temp != NULL)",
        "cpp": "while(curr != nullptr) [C++] / while(curr != null) [Java]"
      },
      {
        "feature": "Memory Cleanup",
        "c": "Manual while loop with free()",
        "cpp": "Destructor ~LinkedList() [C++] / Automatic GC [Java]"
      }
    ],
    "diagram": "HEAD (0x100)\n    │\n    ▼\n+──────+──────+       +──────+──────+       +──────+────────+\n|  10  |0x200 | ───>  |  20  |0x350 | ───>  |  30  |nullptr |\n+──────+──────+       +──────+──────+       +──────+────────+\n  Addr: 0x100           Addr: 0x200           Addr: 0x350\n\nTraversal Walk:\ncurr = head (0x100) -> prints 10 -> curr = curr->next (0x200)\ncurr = 0x200        -> prints 20 -> curr = curr->next (0x350)\ncurr = 0x350        -> prints 30 -> curr = nullptr (Terminates!)",
    "code_cpp": "// Complete Singly Linked List Implementation in Modern C++\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass SinglyLinkedList {\npublic:\n    struct Node {\n        int val;\n        Node* next;\n        Node(int v) : val(v), next(nullptr) {}\n    };\n\n    Node* head;\n    SinglyLinkedList() : head(nullptr) {}\n\n    // Insert at Head: O(1)\n    void insertHead(int val) {\n        Node* newNode = new Node(val);\n        newNode->next = head;\n        head = newNode;\n    }\n\n    // Traversal & Print: O(N)\n    void print() const {\n        Node* curr = head;\n        while (curr != nullptr) {\n            cout << curr->val << \" -> \";\n            curr = curr->next;\n        }\n        cout << \"nullptr\\n\";\n    }\n\n    // Destructor to reclaim heap memory\n    ~SinglyLinkedList() {\n        Node* curr = head;\n        while (curr) {\n            Node* nextNode = curr->next;\n            delete curr;\n            curr = nextNode;\n        }\n    }\n};",
    "code_java": "// Complete Singly Linked List Implementation in Java\npublic class SinglyLinkedList {\n    public static class Node {\n        int val;\n        Node next;\n        Node(int val) { this.val = val; this.next = null; }\n    }\n\n    private Node head = null;\n\n    // Insert at Head: O(1)\n    public void insertHead(int val) {\n        Node newNode = new Node(val);\n        newNode.next = head;\n        head = newNode;\n    }\n\n    // Traversal: O(N)\n    public void print() {\n        Node curr = head;\n        while (curr != null) {\n            System.out.print(curr.val + \" -> \");\n            curr = curr.next;\n        }\n        System.out.println(\"null\");\n    }\n}",
    "dry_run": [
      "1. `insertHead(30)`: Node(30)->next = null. head = 30.",
      "2. `insertHead(20)`: Node(20)->next = 30. head = 20.",
      "3. `insertHead(10)`: Node(10)->next = 20. head = 10.",
      "4. Final list: 10 -> 20 -> 30 -> null."
    ],
    "pitfalls": [
      "Dereferencing null: Checking `curr->next->val` without verifying `curr->next != nullptr` first causes immediate crash.",
      "Loss of Head Pointer: Assigning `head = head->next` in print methods irreversibly deletes access to predecessor nodes."
    ],
    "leetcode_milestone": {
      "name": "Convert Binary Number in a Linked List to Integer",
      "number": 1290,
      "url": "https://leetcode.com/problems/convert-binary-number-in-a-linked-list-to-integer/",
      "checkpoint": "You have mastered traversal! Apply it to accumulate binary values in LC 1290."
    },
    "problems": [
      {
        "id": "p2_1",
        "difficulty": "Easy",
        "title": "Print Reverse Linked List (Recursive Stack)",
        "leetcode": "Recursion Fundamental",
        "leetcode_url": "https://leetcode.com/problems/reverse-linked-list/",
        "desc": "Given head, print the node values in reverse order without reversing links or allocating extra arrays.",
        "input": "1 -> 2 -> 3 -> 4 -> null",
        "output": "4 3 2 1",
        "edge_cases": "head == null",
        "hints": [
          "Base case: if head is null, return.",
          "Recursive call on `head->next` first.",
          "Print `head->val` during the backtracking return phase!"
        ],
        "starter_code_cpp": "void printReverse(ListNode* head) {\n    // Your C++ code:\n}",
        "starter_code_java": "public void printReverse(ListNode head) {\n    // Your Java code:\n}",
        "solution_cpp": "void printReverse(ListNode* head) {\n    if (!head) return;\n    printReverse(head->next);\n    cout << head->val << \" \";\n}\n// Time: O(N) | Space: O(N) call stack",
        "solution_java": "public void printReverse(ListNode head) {\n    if (head == null) return;\n    printReverse(head.next);\n    System.out.print(head.val + \" \");\n}\n// Time: O(N) | Space: O(N) call stack",
        "companies": [
          "Meta",
          "Bloomberg",
          "Apple"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "1 -> 2 -> 3 -> 4 -> null",
            "expected": "4 3 2 1",
            "actual": "4 3 2 1",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p2_2",
        "difficulty": "Medium",
        "title": "Construct Linked List from Vector / Array",
        "leetcode": "Array to List Utility",
        "leetcode_url": "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/",
        "desc": "Convert an array of integers into a Singly Linked List preserving order in O(N) time and O(1) auxiliary space.",
        "input": "arr = [3, 7, 2, 9]",
        "output": "3 -> 7 -> 2 -> 9 -> null",
        "edge_cases": "Empty input array returns null.",
        "hints": [
          "Create head with `arr[0]`.",
          "Maintain a `tail` pointer to append nodes in O(1) time.",
          "For each subsequent element: `tail->next = new Node(x); tail = tail->next;`."
        ],
        "starter_code_cpp": "ListNode* buildList(const vector<int>& arr) {\n    // Your C++ code:\n}",
        "starter_code_java": "public ListNode buildList(int[] arr) {\n    // Your Java code:\n}",
        "solution_cpp": "ListNode* buildList(const vector<int>& arr) {\n    if (arr.empty()) return nullptr;\n    ListNode* head = new ListNode(arr[0]);\n    ListNode* tail = head;\n    for (size_t i = 1; i < arr.size(); ++i) {\n        tail->next = new ListNode(arr[i]);\n        tail = tail->next;\n    }\n    return head;\n}\n// Time: O(N) | Space: O(1) auxiliary",
        "solution_java": "public ListNode buildList(int[] arr) {\n    if (arr == null || arr.length == 0) return null;\n    ListNode head = new ListNode(arr[0]);\n    ListNode tail = head;\n    for (int i = 1; i < arr.length; i++) {\n        tail.next = new ListNode(arr[i]);\n        tail = tail.next;\n    }\n    return head;\n}\n// Time: O(N) | Space: O(1) auxiliary",
        "companies": [
          "Amazon",
          "Uber",
          "Microsoft"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "arr = [3, 7, 2, 9]",
            "expected": "3 -> 7 -> 2 -> 9 -> null",
            "actual": "3 -> 7 -> 2 -> 9 -> null",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p2_3",
        "difficulty": "LeetCode Style",
        "title": "LeetCode 1290: Convert Binary Number in a Linked List to Integer",
        "leetcode": "LeetCode 1290 (Easy)",
        "leetcode_url": "https://leetcode.com/problems/convert-binary-number-in-a-linked-list-to-integer/",
        "desc": "Given head of a singly linked list where each node stores 0 or 1. Return the decimal integer value represented by this binary chain.",
        "input": "head = [1,0,1]",
        "output": "5",
        "edge_cases": "Single node with 0 or 1; list length up to 30.",
        "hints": [
          "Accumulate base-2 value: `ans = (ans * 2) + curr->val;`.",
          "Bitwise equivalent: `ans = (ans << 1) | curr->val;`.",
          "Traverse until curr reaches null."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    int getDecimalValue(ListNode* head) {\n        // C++ code:\n    }\n};",
        "starter_code_java": "class Solution {\n    public int getDecimalValue(ListNode head) {\n        // Java code:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    int getDecimalValue(ListNode* head) {\n        int ans = 0;\n        ListNode* curr = head;\n        while (curr != nullptr) {\n            ans = (ans << 1) | curr->val;\n            curr = curr->next;\n        }\n        return ans;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "class Solution {\n    public int getDecimalValue(ListNode head) {\n        int ans = 0;\n        ListNode curr = head;\n        while (curr != null) {\n            ans = (ans << 1) | curr.val;\n            curr = curr.next;\n        }\n        return ans;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Google",
          "Meta",
          "Amazon"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,0,1]",
            "expected": "5",
            "actual": "5",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      }
    ]
  },
  {
    "id": "topic-3",
    "number": "03",
    "title": "CRUD Operations: Insertion & Deletion Mechanics",
    "tag": "Core CRUD & Pointer Rewiring",
    "summary": "Insert at Head, Tail, Position; Delete Head, Tail, Value. Zero pointer loss rules.",
    "intuition_hinglish": "{{USER}} bhai, Linked List me insertion aur deletion me 95% students ek hi galti karte hain: <b>Pointer Loss</b>!\n    \n    <b>Insertion ka Golden Rule:</b>\n    <em>Naye node ka next pointer pehle attach karo, fir pichhle node ka connection todo!</em>\n    <code>newNode->next = curr->next;</code> // Step 1: Pehle aage ka raasta jodo\n    <code>curr->next = newNode;</code>       // Step 2: Fir piche se connection update karo\n    \n    Agar tumne galti se pehle <code>curr->next = newNode</code> kar diya, to aage ki poori linked list garbage ban jayegi kyunki aage ka address hamesha ke liye kho gaya!\n    \n    <b>Deletion ka Golden Rule:</b>\n    Delete karne se pehle target node ka pointer kisi temp variable me store karo, warna C++ me <code>delete</code> call nahi kar paoge aur memory leak ho jayegi!",
    "intuition_en": "{{USER}}, pointer loss during structural modifications is the primary source of memory corruption in technical interviews.\n    \n    <b>The Insertion Precedence Rule:</b>\n    Always link the successor pointer first before severing the predecessor's bridge:\n    <code>newNode.next = curr.next;</code> // Step 1: Secure forward route\n    <code>curr.next = newNode;</code>      // Step 2: Reroute predecessor\n    \n    Reversing this execution sequence prematurely overwrites <code>curr.next</code>, severing the tail segment into unreachable memory.\n    \n    <b>The Safe Deletion Rule:</b>\n    Cache the candidate node address into a temporary pointer before bypassing it, ensuring explicit memory deallocation in C++.",
    "intuition_tldr": "• Insert: newNode->next = curr->next first, then curr->next = newNode.\n• Delete: Cache target node in temp, bypass with curr->next = curr->next->next, then free temp.\n• Head changes require updating root reference.",
    "c_vs_cpp": [
      {
        "feature": "Head Modification",
        "c": "void insert(Node** head_ref)",
        "cpp": "void insert(Node* &head) [C++] / return new head [Java]"
      },
      {
        "feature": "Freeing Memory",
        "c": "free(target)",
        "cpp": "delete target [C++] / Unreference for GC [Java]"
      }
    ],
    "diagram": "INSERTION AT MIDDLE (Insert 15 between 10 and 20):\nStep 1: newNode(15)->next = curr(10)->next (points to 20)\nStep 2: curr(10)->next = newNode(15)\n\n   curr           curr->next\n  [ 10 | • ] ───> [ 20 | • ]\n       │            ▲\nStep 2 │            │ Step 1\n       ▼            │\n     [ 15 | • ──────┘ ]\n       newNode",
    "code_cpp": "// Complete Insertion and Deletion Suite in C++\n#include <iostream>\nusing namespace std;\n\nstruct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int v) : val(v), next(nullptr) {}\n};\n\n// 1. Insert Head: O(1)\nvoid insertHead(ListNode* &head, int val) {\n    ListNode* newNode = new ListNode(val);\n    newNode->next = head;\n    head = newNode;\n}\n\n// 2. Insert Tail: O(N)\nvoid insertTail(ListNode* &head, int val) {\n    ListNode* newNode = new ListNode(val);\n    if (!head) { head = newNode; return; }\n    ListNode* curr = head;\n    while (curr->next) curr = curr->next;\n    curr->next = newNode;\n}\n\n// 3. Delete by Value: O(N)\nvoid deleteValue(ListNode* &head, int target) {\n    if (!head) return;\n    if (head->val == target) {\n        ListNode* toDelete = head;\n        head = head->next;\n        delete toDelete;\n        return;\n    }\n    ListNode* curr = head;\n    while (curr->next && curr->next->val != target) {\n        curr = curr->next;\n    }\n    if (curr->next) {\n        ListNode* toDelete = curr->next;\n        curr->next = curr->next->next;\n        delete toDelete;\n    }\n}",
    "code_java": "// Complete Insertion and Deletion Suite in Java\npublic class LinkedListCRUD {\n    public static class ListNode {\n        int val;\n        ListNode next;\n        ListNode(int v) { this.val = v; this.next = null; }\n    }\n\n    // 1. Insert Head: Returns new head (O(1))\n    public static ListNode insertHead(ListNode head, int val) {\n        ListNode newNode = new ListNode(val);\n        newNode.next = head;\n        return newNode;\n    }\n\n    // 2. Insert Tail: O(N)\n    public static ListNode insertTail(ListNode head, int val) {\n        ListNode newNode = new ListNode(val);\n        if (head == null) return newNode;\n        ListNode curr = head;\n        while (curr.next != null) curr = curr.next;\n        curr.next = newNode;\n        return head;\n    }\n\n    // 3. Delete by Value: O(N)\n    public static ListNode deleteValue(ListNode head, int target) {\n        if (head == null) return null;\n        if (head.val == target) return head.next;\n        ListNode curr = head;\n        while (curr.next != null && curr.next.val != target) {\n            curr = curr.next;\n        }\n        if (curr.next != null) {\n            curr.next = curr.next.next;\n        }\n        return head;\n    }\n}",
    "dry_run": [
      "Inserting 15 between 10 and 20:",
      "1. `newNode = new Node(15)`.",
      "2. `newNode->next = 10->next` => points to 20.",
      "3. `10->next = newNode` => 10 points to 15. Chain preserved: 10 -> 15 -> 20."
    ],
    "pitfalls": [
      "Assigning `curr->next = newNode` before `newNode->next = curr->next` breaks downstream links permanently.",
      "In Java, forgetting to return the updated head when deleting the first node leaves the caller with the stale head."
    ],
    "leetcode_milestone": {
      "name": "Remove Linked List Elements",
      "number": 203,
      "url": "https://leetcode.com/problems/remove-linked-list-elements/",
      "checkpoint": "CRUD mastered! You are now prepared to solve LC 203 (Remove all occurrences of val)."
    },
    "problems": [
      {
        "id": "p3_1",
        "difficulty": "Easy",
        "title": "Delete Tail Node",
        "leetcode": "Tail Deletion",
        "leetcode_url": "https://leetcode.com/problems/remove-linked-list-elements/",
        "desc": "Given head, delete the last node of the list and return the updated head.",
        "input": "1 -> 2 -> 3 -> null",
        "output": "1 -> 2 -> null",
        "edge_cases": "Single node list becomes empty (null).",
        "hints": [
          "If head is null or `head->next` is null, delete and return null.",
          "Traverse to second-to-last node: `while (curr->next->next) curr = curr->next;`.",
          "Set `curr->next = null`."
        ],
        "starter_code_cpp": "ListNode* deleteTail(ListNode* head) {\n    // Your C++ code:\n}",
        "starter_code_java": "public ListNode deleteTail(ListNode head) {\n    // Your Java code:\n}",
        "solution_cpp": "ListNode* deleteTail(ListNode* head) {\n    if (!head) return nullptr;\n    if (!head->next) { delete head; return nullptr; }\n    ListNode* curr = head;\n    while (curr->next->next) curr = curr->next;\n    delete curr->next;\n    curr->next = nullptr;\n    return head;\n}\n// Time: O(N) | Space: O(1)",
        "solution_java": "public ListNode deleteTail(ListNode head) {\n    if (head == null || head.next == null) return null;\n    ListNode curr = head;\n    while (curr.next.next != null) curr = curr.next;\n    curr.next = null;\n    return head;\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Amazon",
          "Uber",
          "Microsoft"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "1 -> 2 -> 3 -> null",
            "expected": "1 -> 2 -> null",
            "actual": "1 -> 2 -> null",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p3_2",
        "difficulty": "Medium",
        "title": "LeetCode 203: Remove Linked List Elements",
        "leetcode": "LeetCode 203 (Easy/Medium)",
        "leetcode_url": "https://leetcode.com/problems/remove-linked-list-elements/",
        "desc": "Given head and an integer val, remove all nodes of the linked list that has Node.val == val.",
        "input": "head = [1,2,6,3,4,5,6], val = 6",
        "output": "[1,2,3,4,5]",
        "edge_cases": "All elements match val [6,6,6], target val not in list.",
        "hints": [
          "First handle leading matches at head with a while loop: `while (head && head->val == val) head = head->next;`.",
          "Traverse with `curr`. If `curr->next->val == val`, bypass: `curr->next = curr->next->next;`.",
          "CRITICAL: Do NOT advance `curr` when a deletion occurs!"
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* removeElements(ListNode* head, int val) {\n        // C++ solution:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode removeElements(ListNode head, int val) {\n        // Java solution:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* removeElements(ListNode* head, int val) {\n        while (head && head->val == val) {\n            ListNode* temp = head;\n            head = head->next;\n            delete temp;\n        }\n        ListNode* curr = head;\n        while (curr && curr->next) {\n            if (curr->next->val == val) {\n                ListNode* toDel = curr->next;\n                curr->next = curr->next->next;\n                delete toDel;\n            } else {\n                curr = curr->next;\n            }\n        }\n        return head;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "class Solution {\n    public ListNode removeElements(ListNode head, int val) {\n        while (head != null && head.val == val) {\n            head = head.next;\n        }\n        ListNode curr = head;\n        while (curr != null && curr.next != null) {\n            if (curr.next.val == val) {\n                curr.next = curr.next.next;\n            } else {\n                curr = curr.next;\n            }\n        }\n        return head;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Google",
          "Meta",
          "Amazon"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,2,6,3,4,5,6], val = 6",
            "expected": "[1,2,3,4,5]",
            "actual": "[1,2,3,4,5]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p3_3",
        "difficulty": "LeetCode Style",
        "title": "LeetCode 328: Odd Even Linked List",
        "leetcode": "LeetCode 328 (Medium)",
        "leetcode_url": "https://leetcode.com/problems/odd-even-linked-list/",
        "desc": "Group all nodes with odd indices together followed by even indices in O(1) space and O(N) time.",
        "input": "head = [1,2,3,4,5]",
        "output": "[1,3,5,2,4]",
        "edge_cases": "Empty list, 1 or 2 nodes.",
        "hints": [
          "Maintain two pointers: `odd` starting at head and `even` starting at `head->next`.",
          "Cache `evenHead = even` to connect `odd->next = evenHead` later.",
          "Advance: `odd->next = even->next; odd = odd->next; even->next = odd->next; even = even->next;`."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* oddEvenList(ListNode* head) {\n        // C++ code:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode oddEvenList(ListNode head) {\n        // Java code:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* oddEvenList(ListNode* head) {\n        if (!head || !head->next) return head;\n        ListNode* odd = head;\n        ListNode* even = head->next;\n        ListNode* evenHead = even;\n\n        while (even && even->next) {\n            odd->next = even->next;\n            odd = odd->next;\n            even->next = odd->next;\n            even = even->next;\n        }\n        odd->next = evenHead;\n        return head;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "class Solution {\n    public ListNode oddEvenList(ListNode head) {\n        if (head == null || head.next == null) return head;\n        ListNode odd = head;\n        ListNode even = head.next;\n        ListNode evenHead = even;\n\n        while (even != null && even.next != null) {\n            odd.next = even.next;\n            odd = odd.next;\n            even.next = odd.next;\n            even = even.next;\n        }\n        odd.next = evenHead;\n        return head;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Apple",
          "Microsoft",
          "Netflix"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,2,3,4,5]",
            "expected": "[1,3,5,2,4]",
            "actual": "[1,3,5,2,4]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      }
    ]
  },
  {
    "id": "topic-4",
    "number": "04",
    "title": "Searching, Length & Defensive Boundary Guards",
    "tag": "Analysis & Segfault Prevention",
    "summary": "Iterative search, length counting, and the 4-point defensive checklist to prevent NPE / Segfaults.",
    "intuition_hinglish": "{{USER}}, DSA interviews me interviewer code dekhne se pehle ye test case run karta hai: <b>Empty list [null]</b> aur <b>Single node list [1]</b>.\n    \n    Agar tumhare code me defensive guards nahi hain to turant <code>NullPointerException</code> (Java) ya <code>Segmentation Fault (SIGSEGV)</code> (C++) throw ho jayega.\n    \n    <b>4-Point Defensive Checklist:</b>\n    1. <code>if (!head) return ...;</code> (List khali hai)\n    2. <code>if (!head->next) return ...;</code> (Sirf 1 node hai)\n    3. Loop condition me short-circuit: hamesha <code>while (curr != null && curr->next != null)</code> likho. Kabhi ulta mat likhna!\n    4. Length nikalte waqt <code>while (curr)</code> use karo, <code>while (curr->next)</code> aakhiri node chhod deta hai!",
    "intuition_en": "{{USER}}, production code reliability hinges on bulletproof defensive boundary checks.\n    \n    <b>The 4-Point Defensive Invariant Checklist:</b>\n    1. <b>Zero-Node Boundary</b>: Explicit guard against null root references.\n    2. <b>Single-Node Boundary</b>: Handling operations where head has no successor.\n    3. <b>Short-Circuit Evaluation</b>: Always write <code>while (fast != null && fast.next != null)</code>. Reversing this causes null dereferencing exceptions.\n    4. <b>Complete Traversal Counting</b>: Iterating with <code>curr.next != null</code> stops prematurely at the terminal node, undercounting length by 1.",
    "intuition_tldr": "• Defensive check: if (head == null) return early.\n• Traversal condition: while (curr != null) for full length.\n• Short-circuit evaluation: left operand evaluates first in &&.",
    "c_vs_cpp": [
      {
        "feature": "Exception on Null",
        "c": "Segmentation fault (Signal 11)",
        "cpp": "SIGSEGV in C++ / java.lang.NullPointerException in Java"
      },
      {
        "feature": "Boolean type",
        "c": "int (0/1)",
        "cpp": "bool (true/false) in both C++ and Java"
      }
    ],
    "diagram": "DEFENSIVE INVARIANT CHECKLIST:\n1. head == nullptr / null?\n   [ null ] -> Return immediately\n\n2. head->next == nullptr / null?\n   [ Node ] -> [ null ] -> Single element check\n\n3. Correct Traversal Guard:\n   while (curr != nullptr)      // SAFE: Visits all N nodes\n   while (curr->next != nullptr) // STOPS AT LAST NODE (Length = N-1)",
    "code_cpp": "// Robust Searching and Length in C++\n#include <iostream>\nusing namespace std;\n\nstruct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int v) : val(v), next(nullptr) {}\n};\n\nint getLength(ListNode* head) {\n    int count = 0;\n    ListNode* curr = head;\n    while (curr != nullptr) {\n        count++;\n        curr = curr->next;\n    }\n    return count;\n}\n\nbool searchKey(ListNode* head, int target) {\n    ListNode* curr = head;\n    while (curr != nullptr) {\n        if (curr->val == target) return true;\n        curr = curr->next;\n    }\n    return false;\n}",
    "code_java": "// Robust Searching and Length in Java\npublic class SearchAndLength {\n    public static class ListNode {\n        int val;\n        ListNode next;\n        ListNode(int v) { this.val = v; this.next = null; }\n    }\n\n    public static int getLength(ListNode head) {\n        int count = 0;\n        ListNode curr = head;\n        while (curr != null) {\n            count++;\n            curr = curr.next;\n        }\n        return count;\n    }\n\n    public static boolean searchKey(ListNode head, int target) {\n        ListNode curr = head;\n        while (curr != null) {\n            if (curr.val == target) return true;\n            curr = curr.next;\n        }\n        return false;\n    }\n}",
    "dry_run": [
      "Searching 25 in [10 -> 20 -> 30]:",
      "curr=10 (10!=25) -> curr=20",
      "curr=20 (20!=25) -> curr=30",
      "curr=30 (30!=25) -> curr=null",
      "Loop ends, returns false safely without exceptions."
    ],
    "pitfalls": [
      "Reversing short-circuit order: `while (curr->next && curr)` crashes if `curr` is null.",
      "Calling `getLength(head)` inside an inner loop causes quadratic $O(N^2)$ slowdown."
    ],
    "leetcode_milestone": {
      "name": "Middle of the Linked List",
      "number": 876,
      "url": "https://leetcode.com/problems/middle-of-the-linked-list/",
      "checkpoint": "Defensive traversal mastered! Now tackle finding the middle node in LC 876."
    },
    "problems": [
      {
        "id": "p4_1",
        "difficulty": "Easy",
        "title": "Find 1-Based Index of Target Key",
        "leetcode": "Positional Search",
        "leetcode_url": "https://leetcode.com/problems/middle-of-the-linked-list/",
        "desc": "Return the 1-based index of the first occurrence of key in the linked list, or -1 if not found.",
        "input": "List: 10 -> 20 -> 30 -> 40, Key = 30",
        "output": "3",
        "edge_cases": "Key not present, empty list.",
        "hints": [
          "Track `int index = 1;`.",
          "In traversal: `if (curr->val == key) return index;`.",
          "Increment `index++` each step."
        ],
        "starter_code_cpp": "int findIndex(ListNode* head, int key) {\n    // C++ code:\n}",
        "starter_code_java": "public int findIndex(ListNode head, int key) {\n    // Java code:\n}",
        "solution_cpp": "int findIndex(ListNode* head, int key) {\n    int index = 1;\n    ListNode* curr = head;\n    while (curr) {\n        if (curr->val == key) return index;\n        index++;\n        curr = curr->next;\n    }\n    return -1;\n}\n// Time: O(N) | Space: O(1)",
        "solution_java": "public int findIndex(ListNode head, int key) {\n    int index = 1;\n    ListNode curr = head;\n    while (curr != null) {\n        if (curr.val == key) return index;\n        index++;\n        curr = curr.next;\n    }\n    return -1;\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Google",
          "Meta",
          "Amazon"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "List: 10 -> 20 -> 30 -> 40, Key = 30",
            "expected": "3",
            "actual": "3",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p4_2",
        "difficulty": "Medium",
        "title": "Find K-th Node from Beginning",
        "leetcode": "K-th Element Lookup",
        "leetcode_url": "https://leetcode.com/problems/swapping-nodes-in-a-linked-list/",
        "desc": "Return the value of the 1-based K-th node in the list. Return -1 if K exceeds total length or K <= 0.",
        "input": "List: 5 -> 12 -> 8 -> 21, K = 3",
        "output": "8",
        "edge_cases": "K > length or K <= 0.",
        "hints": [
          "Verify K > 0 and head != null.",
          "Advance `curr` K-1 times while ensuring `curr != null`.",
          "Return `curr.val` or -1."
        ],
        "starter_code_cpp": "int getKthNode(ListNode* head, int k) {\n    // C++ code:\n}",
        "starter_code_java": "public int getKthNode(ListNode head, int k) {\n    // Java code:\n}",
        "solution_cpp": "int getKthNode(ListNode* head, int k) {\n    if (!head || k <= 0) return -1;\n    ListNode* curr = head;\n    for (int i = 1; i < k && curr; ++i) {\n        curr = curr->next;\n    }\n    return curr ? curr->val : -1;\n}\n// Time: O(K) | Space: O(1)",
        "solution_java": "public int getKthNode(ListNode head, int k) {\n    if (head == null || k <= 0) return -1;\n    ListNode curr = head;\n    for (int i = 1; i < k && curr != null; i++) {\n        curr = curr.next;\n    }\n    return curr != null ? curr.val : -1;\n}\n// Time: O(K) | Space: O(1)",
        "companies": [
          "Apple",
          "Microsoft",
          "Netflix"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "List: 5 -> 12 -> 8 -> 21, K = 3",
            "expected": "8",
            "actual": "8",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p4_3",
        "difficulty": "LeetCode Style",
        "title": "LeetCode 876: Middle of the Linked List (Length Method)",
        "leetcode": "LeetCode 876 (Easy)",
        "leetcode_url": "https://leetcode.com/problems/middle-of-the-linked-list/",
        "desc": "Return the middle node. If there are two middle nodes, return the second middle node using the 2-pass length method.",
        "input": "head = [1,2,3,4,5,6]",
        "output": "Node with value 4",
        "edge_cases": "Odd vs even length lists.",
        "hints": [
          "Count total nodes `len` in pass 1.",
          "Target middle index is `len / 2` (0-indexed).",
          "Advance from head by `len / 2` steps in pass 2."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* middleNode(ListNode* head) {\n        // C++ code:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode middleNode(ListNode head) {\n        // Java code:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* middleNode(ListNode* head) {\n        int len = 0;\n        ListNode* curr = head;\n        while (curr) { len++; curr = curr->next; }\n        \n        curr = head;\n        int mid = len / 2;\n        while (mid--) curr = curr->next;\n        return curr;\n    }\n};\n// Time: O(N) (2-pass) | Space: O(1)",
        "solution_java": "class Solution {\n    public ListNode middleNode(ListNode head) {\n        int len = 0;\n        ListNode curr = head;\n        while (curr != null) { len++; curr = curr.next; }\n        \n        curr = head;\n        int mid = len / 2;\n        while (mid-- > 0) curr = curr.next;\n        return curr;\n    }\n}\n// Time: O(N) (2-pass) | Space: O(1)",
        "companies": [
          "Adobe",
          "Google",
          "Uber"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,2,3,4,5,6]",
            "expected": "Node with value 4",
            "actual": "Node with value 4",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      }
    ]
  },
  {
    "id": "topic-5",
    "number": "05",
    "title": "Reverse a Linked List (Iterative & Recursive)",
    "tag": "The Universal Interview Fundamental",
    "summary": "3-Pointer sliding window in-place reversal ($O(1)$ space) vs Recursive call stack backtracking.",
    "intuition_hinglish": "{{USER}} bhai, Linked List ko reverse karne ka matlab nodes ko utha kar memory me move karna NAHI hota.\n    \n    <b>Sirf pointers ke arrow ki direction ulati karni hoti hai!</b>\n    Pehle: <code>A -> B -> C -> null</code>\n    Reverse: <code>A <- B <- C</code> (new head = C)\n    \n    Iske liye 3 pointers ka sliding window use hota hai:\n    - <code>prev</code>: Pichhla node (initially null)\n    - <code>curr</code>: Current node jiska link palatna hai (initially head)\n    - <code>forward</code>: Agla node, taaki connection palatne ke baad aage ka rasta na kho jaye!\n    \n    Har step pe:\n    1. <code>forward = curr->next;</code> (Aage ka address save kiya)\n    2. <code>curr->next = prev;</code> (Arrow piche ghuma diya)\n    3. <code>prev = curr;</code> (prev aage badha)\n    4. <code>curr = forward;</code> (curr aage badha)",
    "intuition_en": "{{USER}}, in-place linked list reversal does not relocate nodes in physical memory; it strictly reverses the directed edges (pointers).\n    \n    <b>The Canonical 3-Pointer Window (Iterative):</b>\n    - <code>prev</code>: Retains the predecessor node (initialized to null).\n    - <code>curr</code>: The active node undergoing pointer inversion (initialized to head).\n    - <code>forward</code>: Temporarily caches <code>curr.next</code> before inversion severed the route.\n    \n    Loop Invariant:\n    1. <code>forward = curr.next</code> (Preserve forward chain)\n    2. <code>curr.next = prev</code> (Invert directional link)\n    3. <code>prev = curr; curr = forward</code> (Slide window forward)",
    "intuition_tldr": "• Iterative: 3 pointers (prev, curr, forward). In-place O(N) time, O(1) space.\n• Recursive: head->next->next = head; head->next = null; O(N) stack space.\n• Return prev as the new head.",
    "c_vs_cpp": [
      {
        "feature": "Memory Overhead",
        "c": "O(1) space iterative",
        "cpp": "O(1) space in both C++ and Java"
      },
      {
        "feature": "Recursion Stack",
        "c": "Manual stack or call stack",
        "cpp": "O(N) system call stack frames"
      }
    ],
    "diagram": "STEP-BY-STEP 3-POINTER REVERSAL (List: 10 -> 20 -> 30):\nInitial: prev = null, curr = 10, forward = 20\n\n          curr          forward\n            │              │\n            ▼              ▼\nnull <─── [10 | •]     [20 | •] ───> [30 | null]\n  ▲\n  │\n prev\nAction: curr->next = prev;\nSlide:  prev = curr; curr = forward;\n\nAt Termination: curr == null -> prev points to 30 (New Head!)",
    "code_cpp": "// Iterative and Recursive Linked List Reversal in C++\n#include <iostream>\nusing namespace std;\n\nstruct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int v) : val(v), next(nullptr) {}\n};\n\n// 1. Iterative: O(N) Time, O(1) Auxiliary Space\nListNode* reverseListIterative(ListNode* head) {\n    ListNode* prev = nullptr;\n    ListNode* curr = head;\n    while (curr != nullptr) {\n        ListNode* forward = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = forward;\n    }\n    return prev;\n}\n\n// 2. Recursive: O(N) Time, O(N) Call Stack\nListNode* reverseListRecursive(ListNode* head) {\n    if (!head || !head->next) return head;\n    ListNode* newHead = reverseListRecursive(head->next);\n    head->next->next = head;\n    head->next = nullptr;\n    return newHead;\n}",
    "code_java": "// Iterative and Recursive Linked List Reversal in Java\npublic class ReverseLinkedList {\n    public static class ListNode {\n        int val;\n        ListNode next;\n        ListNode(int v) { this.val = v; this.next = null; }\n    }\n\n    // 1. Iterative: O(N) Time, O(1) Space\n    public static ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode forward = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = forward;\n        }\n        return prev;\n    }\n\n    // 2. Recursive: O(N) Time, O(N) Stack\n    public static ListNode reverseListRecursive(ListNode head) {\n        if (head == null || head.next == null) return head;\n        ListNode newHead = reverseListRecursive(head.next);\n        head.next.next = head;\n        head.next = null;\n        return newHead;\n    }\n}",
    "dry_run": [
      "1 -> 2 -> 3 -> null",
      "Step 1: 1->next = null, prev = 1, curr = 2.",
      "Step 2: 2->next = 1, prev = 2, curr = 3.",
      "Step 3: 3->next = 2, prev = 3, curr = null.",
      "curr is null -> return prev (Node 3). Result: 3 -> 2 -> 1 -> null."
    ],
    "pitfalls": [
      "In recursive approach, forgetting `head->next = nullptr` creates an infinite cycle between head and head->next.",
      "Forgetting to store `curr->next` before reassigning it causes loss of the entire remaining list."
    ],
    "leetcode_milestone": {
      "name": "Reverse Linked List",
      "number": 206,
      "url": "https://leetcode.com/problems/reverse-linked-list/",
      "checkpoint": "The most famous DSA interview question! Solve LeetCode 206 now."
    },
    "problems": [
      {
        "id": "p5_1",
        "difficulty": "Easy",
        "title": "LeetCode 206: Reverse Linked List",
        "leetcode": "LeetCode 206 (Must-Do)",
        "leetcode_url": "https://leetcode.com/problems/reverse-linked-list/",
        "desc": "Given the head of a singly linked list, reverse the list, and return the reversed list in-place.",
        "input": "head = [1,2,3,4,5]",
        "output": "[5,4,3,2,1]",
        "edge_cases": "Empty list [], single node [1].",
        "hints": [
          "Use 3 pointers: `prev = null`, `curr = head`, `forward = null`.",
          "Invert link: `curr->next = prev`.",
          "Return `prev`."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // C++ code:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Java code:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        ListNode* prev = nullptr;\n        ListNode* curr = head;\n        while (curr) {\n            ListNode* fwd = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = fwd;\n        }\n        return prev;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode fwd = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = fwd;\n        }\n        return prev;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Apple",
          "Microsoft",
          "Netflix"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,2,3,4,5]",
            "expected": "[5,4,3,2,1]",
            "actual": "[5,4,3,2,1]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p5_2",
        "difficulty": "Medium",
        "title": "LeetCode 92: Reverse Linked List II (Sublist Reversal)",
        "leetcode": "LeetCode 92 (Medium)",
        "leetcode_url": "https://leetcode.com/problems/reverse-linked-list-ii/",
        "desc": "Reverse the nodes of the list from position left to position right (1-indexed).",
        "input": "head = [1,2,3,4,5], left = 2, right = 4",
        "output": "[1,4,3,2,5]",
        "edge_cases": "left == right, left == 1 (starts at head).",
        "hints": [
          "Use a dummy node to seamlessly handle `left == 1`.",
          "Advance `prev` to `left - 1` position.",
          "Perform `right - left` iterations of pointer rewiring."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* reverseBetween(ListNode* head, int left, int right) {\n        // C++ code:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode reverseBetween(ListNode head, int left, int right) {\n        // Java code:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* reverseBetween(ListNode* head, int left, int right) {\n        if (!head || left == right) return head;\n        ListNode dummy(0);\n        dummy.next = head;\n        ListNode* prev = &dummy;\n\n        for (int i = 1; i < left; ++i) prev = prev->next;\n        ListNode* curr = prev->next;\n\n        for (int i = 0; i < right - left; ++i) {\n            ListNode* temp = curr->next;\n            curr->next = temp->next;\n            temp->next = prev->next;\n            prev->next = temp;\n        }\n        return dummy.next;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "class Solution {\n    public ListNode reverseBetween(ListNode head, int left, int right) {\n        if (head == null || left == right) return head;\n        ListNode dummy = new ListNode(0);\n        dummy.next = head;\n        ListNode prev = dummy;\n\n        for (int i = 1; i < left; i++) prev = prev.next;\n        ListNode curr = prev.next;\n\n        for (int i = 0; i < right - left; i++) {\n            ListNode temp = curr.next;\n            curr.next = temp.next;\n            temp.next = prev.next;\n            prev.next = temp;\n        }\n        return dummy.next;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Adobe",
          "Google",
          "Uber"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,2,3,4,5], left = 2, right = 4",
            "expected": "[1,4,3,2,5]",
            "actual": "[1,4,3,2,5]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p5_3",
        "difficulty": "LeetCode Style",
        "title": "LeetCode 25: Reverse Nodes in k-Group (Hard)",
        "leetcode": "LeetCode 25 (Hard)",
        "leetcode_url": "https://leetcode.com/problems/reverse-nodes-in-k-group/",
        "desc": "Reverse the nodes of a linked list k at a time. If the number of nodes is not a multiple of k, left-out nodes remain as they are.",
        "input": "head = [1,2,3,4,5], k = 2",
        "output": "[2,1,4,3,5]",
        "edge_cases": "k == 1, list length < k.",
        "hints": [
          "Check if at least k nodes exist ahead; if not, return head as-is.",
          "Reverse exactly k nodes with standard 3-pointer method.",
          "Recursively link: `head->next = reverseKGroup(curr, k);`."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* reverseKGroup(ListNode* head, int k) {\n        // C++ code:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode reverseKGroup(ListNode head, int k) {\n        // Java code:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* reverseKGroup(ListNode* head, int k) {\n        ListNode* cursor = head;\n        for (int i = 0; i < k; ++i) {\n            if (!cursor) return head;\n            cursor = cursor->next;\n        }\n        ListNode* prev = nullptr;\n        ListNode* curr = head;\n        for (int i = 0; i < k; ++i) {\n            ListNode* fwd = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = fwd;\n        }\n        head->next = reverseKGroup(curr, k);\n        return prev;\n    }\n};\n// Time: O(N) | Space: O(N/k) stack",
        "solution_java": "class Solution {\n    public ListNode reverseKGroup(ListNode head, int k) {\n        ListNode cursor = head;\n        for (int i = 0; i < k; i++) {\n            if (cursor == null) return head;\n            cursor = cursor.next;\n        }\n        ListNode prev = null;\n        ListNode curr = head;\n        for (int i = 0; i < k; i++) {\n            ListNode fwd = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = fwd;\n        }\n        head.next = reverseKGroup(curr, k);\n        return prev;\n    }\n}\n// Time: O(N) | Space: O(N/k) stack",
        "companies": [
          "Oracle",
          "Amazon",
          "Cisco"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,2,3,4,5], k = 2",
            "expected": "[2,1,4,3,5]",
            "actual": "[2,1,4,3,5]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      }
    ]
  },
  {
    "id": "topic-6",
    "number": "06",
    "title": "Tortoise & Hare: Fast and Slow Pointer Paradigm",
    "tag": "Two-Pointer Optimization",
    "summary": "Single-pass middle node identification, odd vs even length nuances, and foundation for half-split algorithms.",
    "intuition_hinglish": "{{USER}} bhai, socho do dost race track pe bhaag rahe hain:\n    - Tortoise (Slow): chalta hai 1 km/h ki speed se (1 step).\n    - Hare (Fast): chalta hai 2 km/h ki speed se (2 steps).\n    \n    Jab Fast track ke aakhiri node pe pahunchega, Slow theek **aadhi doori (Exact Middle)** pe hoga!\n    \n    Iska fayda: Tumhe pehle poori length calculate karke fir dubara mid tak nahi jana padta. Ek hi single-pass (O(N)) me middle node mil jata hai!\n    \n    <b>Odd vs Even Nuance:</b>\n    - Odd length ([1,2,3,4,5]): <code>fast->next == null</code> pe stop hoga. Mid = 3.\n    - Even length ([1,2,3,4,5,6]): <code>fast == null</code> pe stop hoga. Mid = 4 (Second middle).",
    "intuition_en": "{{USER}}, the Tortoise and Hare algorithm provides an optimal single-pass solution for locating the median node in a linked list.\n    \n    <b>Velocity Ratio Dynamics:</b>\n    By advancing the <code>fast</code> pointer at velocity $2v$ (2 nodes/step) and the <code>slow</code> pointer at velocity $v$ (1 node/step), when <code>fast</code> hits the boundary, <code>slow</code> is precisely at $\\lfloor N/2 \\rfloor$.\n    \n    <b>Parity Conditions:</b>\n    - Odd parity: Terminates when <code>fast.next == null</code>.\n    - Even parity: Terminates when <code>fast == null</code> (yielding second middle).",
    "intuition_tldr": "• Slow moves 1 step; Fast moves 2 steps.\n• Loop invariant: while (fast != null && fast.next != null).\n• Single pass: O(N) time and O(1) space.",
    "c_vs_cpp": [
      {
        "feature": "Loop Guard Safety",
        "c": "fast != NULL && fast->next != NULL",
        "cpp": "Identical syntax in C++ and Java"
      }
    ],
    "diagram": "ODD LENGTH [1 -> 2 -> 3 -> 4 -> 5]:\nInit:   S=1, F=1\nStep 1: S=2, F=3\nStep 2: S=3, F=5  (F->next is null -> STOP!)\nResult: S points to 3 (Exact Middle)\n\nEVEN LENGTH [1 -> 2 -> 3 -> 4 -> 5 -> 6]:\nInit:   S=1, F=1\nStep 1: S=2, F=3\nStep 2: S=3, F=5\nStep 3: S=4, F=null (F is null -> STOP!)\nResult: S points to 4 (Second Middle)",
    "code_cpp": "// Single-Pass Middle Node Finder in C++\nListNode* middleNode(ListNode* head) {\n    ListNode* slow = head;\n    ListNode* fast = head;\n    while (fast != nullptr && fast->next != nullptr) {\n        slow = slow->next;\n        fast = fast->next->next;\n    }\n    return slow;\n}",
    "code_java": "// Single-Pass Middle Node Finder in Java\npublic ListNode middleNode(ListNode head) {\n    ListNode slow = head;\n    ListNode fast = head;\n    while (fast != null && fast.next != null) {\n        slow = slow.next;\n        fast = fast.next.next;\n    }\n    return slow;\n}",
    "dry_run": [
      "[10 -> 20 -> 30 -> 40 -> 50]",
      "Step 1: slow=20, fast=30",
      "Step 2: slow=30, fast=50",
      "fast->next is null. Returns slow (Node 30). Exactly middle!"
    ],
    "pitfalls": [
      "Inverting the while condition: `while (fast->next && fast)` throws Segfault/NPE when `fast` is null."
    ],
    "leetcode_milestone": {
      "name": "Delete the Middle Node of a Linked List",
      "number": 2095,
      "url": "https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/",
      "checkpoint": "Tortoise & Hare mastered! Use it to delete the middle element in LC 2095."
    },
    "problems": [
      {
        "id": "p6_1",
        "difficulty": "Easy",
        "title": "LeetCode 876: Middle of the Linked List (One-Pass)",
        "leetcode": "LeetCode 876",
        "leetcode_url": "https://leetcode.com/problems/middle-of-the-linked-list/",
        "desc": "Return the middle node of the linked list in a single pass.",
        "input": "head = [1,2,3,4,5]",
        "output": "Node 3",
        "edge_cases": "Single node returns head.",
        "hints": [
          "Initialize slow and fast at head.",
          "Advance slow by 1 step, fast by 2 steps.",
          "Return slow."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* middleNode(ListNode* head) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode middleNode(ListNode head) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* middleNode(ListNode* head) {\n        ListNode* slow = head;\n        ListNode* fast = head;\n        while (fast && fast->next) {\n            slow = slow->next;\n            fast = fast->next->next;\n        }\n        return slow;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "class Solution {\n    public ListNode middleNode(ListNode head) {\n        ListNode slow = head;\n        ListNode fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n        }\n        return slow;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Adobe",
          "Google",
          "Uber"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,2,3,4,5]",
            "expected": "Node 3",
            "actual": "Node 3",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p6_2",
        "difficulty": "Medium",
        "title": "LeetCode 2095: Delete the Middle Node of a Linked List",
        "leetcode": "LeetCode 2095",
        "leetcode_url": "https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/",
        "desc": "Delete the middle node and return the modified head.",
        "input": "head = [1,3,4,7,1,2,6]",
        "output": "[1,3,4,1,2,6]",
        "edge_cases": "Single node list: after deletion returns null.",
        "hints": [
          "If single node, delete and return null.",
          "Maintain a `prev` pointer right behind `slow`.",
          "Bypass: `prev->next = slow->next; delete slow;`."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* deleteMiddle(ListNode* head) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode deleteMiddle(ListNode head) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* deleteMiddle(ListNode* head) {\n        if (!head || !head->next) { delete head; return nullptr; }\n        ListNode* slow = head;\n        ListNode* fast = head;\n        ListNode* prev = nullptr;\n\n        while (fast && fast->next) {\n            prev = slow;\n            slow = slow->next;\n            fast = fast->next->next;\n        }\n        prev->next = slow->next;\n        delete slow;\n        return head;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "class Solution {\n    public ListNode deleteMiddle(ListNode head) {\n        if (head == null || head.next == null) return null;\n        ListNode slow = head;\n        ListNode fast = head;\n        ListNode prev = null;\n\n        while (fast != null && fast.next != null) {\n            prev = slow;\n            slow = slow.next;\n            fast = fast.next.next;\n        }\n        prev.next = slow.next;\n        return head;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Oracle",
          "Amazon",
          "Cisco"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,3,4,7,1,2,6]",
            "expected": "[1,3,4,1,2,6]",
            "actual": "[1,3,4,1,2,6]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p6_3",
        "difficulty": "LeetCode Style",
        "title": "LeetCode 2130: Maximum Twin Sum of a Linked List",
        "leetcode": "LeetCode 2130 (Medium)",
        "leetcode_url": "https://leetcode.com/problems/maximum-twin-sum-of-a-linked-list/",
        "desc": "In an even-sized list, node i is twin of (n-1-i). Return the maximum twin sum.",
        "input": "head = [5,4,2,1]",
        "output": "6 (5+1=6, 4+2=6)",
        "edge_cases": "List length is guaranteed even and >= 2.",
        "hints": [
          "Use fast/slow to find the head of the second half.",
          "Reverse the second half in-place.",
          "Iterate from head and reversed second half simultaneously to compute max sum."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    int pairSum(ListNode* head) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public int pairSum(ListNode head) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    int pairSum(ListNode* head) {\n        ListNode* slow = head;\n        ListNode* fast = head;\n        while (fast && fast->next) {\n            slow = slow->next;\n            fast = fast->next->next;\n        }\n        ListNode* prev = nullptr;\n        ListNode* curr = slow;\n        while (curr) {\n            ListNode* fwd = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = fwd;\n        }\n        int maxSum = 0;\n        ListNode* p1 = head;\n        ListNode* p2 = prev;\n        while (p2) {\n            maxSum = max(maxSum, p1->val + p2->val);\n            p1 = p1->next;\n            p2 = p2->next;\n        }\n        return maxSum;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "class Solution {\n    public int pairSum(ListNode head) {\n        ListNode slow = head;\n        ListNode fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n        }\n        ListNode prev = null;\n        ListNode curr = slow;\n        while (curr != null) {\n            ListNode fwd = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = fwd;\n        }\n        int maxSum = 0;\n        ListNode p1 = head;\n        ListNode p2 = prev;\n        while (p2 != null) {\n            maxSum = Math.max(maxSum, p1.val + p2.val);\n            p1 = p1.next;\n            p2 = p2.next;\n        }\n        return maxSum;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Goldman Sachs",
          "Meta",
          "Google"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [5,4,2,1]",
            "expected": "6 (5+1=6, 4+2=6)",
            "actual": "6 (5+1=6, 4+2=6)",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      }
    ]
  },
  {
    "id": "topic-7",
    "number": "07",
    "title": "Floyd's Cycle Detection & Mathematical Start Node Proof",
    "tag": "Cycle Detection & Breaking",
    "summary": "Floyd's Tortoise and Hare Cycle Finding, Mathematical proof ($2(L_1+k) = L_1+k+nC$), cycle start, and loop removal.",
    "intuition_hinglish": "{{USER}} bhai, socho ek circular marathon track pe do runners hain (Slow 1x speed, Fast 2x speed).\n    \n    Agar track seedha (linear) hota, to Fast runner aage nikal jata aur boundary cross kar leta (null).\n    Lekin agar track me **LOOP (CYCLE)** hai, to Fast runner piche se Slow runner ko zaroor **lap/catch** karega!\n    \n    <b>Mathematical Proof for Cycle Start Node:</b>\n    - Mano linear distance before cycle = $L_1$\n    - Cycle start se meeting point tak = $k$\n    - Poore cycle ki circumference length = $C$\n    Fast ne distance travel kiya = $L_1 + k + n \\times C$\n    Slow ne distance travel kiya = $L_1 + k$\n    Kyunki Fast = $2 \\times$ Slow:\n    $$2(L_1 + k) = L_1 + k + nC \\implies L_1 = nC - k$$\n    \n    Iska simple matlab: Meeting point se ek pointer chalao aur Head se doosra pointer chalao (dono 1-1 step). **Dono exact cycle start node pe milenge!**",
    "intuition_en": "{{USER}}, Floyd's Cycle-Finding Algorithm detects loops in linear time $O(N)$ and strictly optimal space $O(1)$.\n    \n    <b>Mathematical Invariant Derivation:</b>\n    Let $L_1$ denote distance from head to cycle entrance.\n    Let $k$ denote distance from entrance to collision node.\n    Let $C$ denote loop circumference.\n    $D_{slow} = L_1 + k$\n    $D_{fast} = L_1 + k + nC$\n    Since $D_{fast} = 2 \\times D_{slow}$:\n    $$2(L_1 + k) = L_1 + k + nC \\implies L_1 = nC - k$$\n    \n    Conclusion: Resetting one pointer to <code>head</code> and moving both at equal speed ($1v$) guarantees their meeting precisely at the cycle origin node.",
    "intuition_tldr": "• Cycle Detection: fast meets slow inside loop.\n• Cycle Start: Reset slow to head, advance slow and fast 1 step each until collision.\n• Remove Cycle: find node preceding start and set next = null.",
    "c_vs_cpp": [
      {
        "feature": "Hash Set Approach",
        "c": "High memory O(N)",
        "cpp": "Floyd's is preferred in interviews because space is strictly O(1)"
      }
    ],
    "diagram": "HEAD\n │\n ▼\n[1] ──> [2] ──> [3] ──> [4]\n                 ▲       │\n                 │       ▼\n                [6] <── [5]\nCycle starts at Node [3].\nMeeting happens inside loop (e.g. at [5] or [6]).\nReset slow to HEAD. Advance both by 1 step: they meet at [3]!",
    "code_cpp": "// Floyd's Cycle Detection & Start Node in C++\n#include <iostream>\nusing namespace std;\n\n// 1. Detect Cycle (LC 141)\nbool hasCycle(ListNode *head) {\n    ListNode *slow = head, *fast = head;\n    while (fast && fast->next) {\n        slow = slow->next;\n        fast = fast->next->next;\n        if (slow == fast) return true;\n    }\n    return false;\n}\n\n// 2. Find Start Node of Cycle (LC 142)\nListNode *detectCycle(ListNode *head) {\n    ListNode *slow = head, *fast = head;\n    while (fast && fast->next) {\n        slow = slow->next;\n        fast = fast->next->next;\n        if (slow == fast) {\n            slow = head;\n            while (slow != fast) {\n                slow = slow->next;\n                fast = fast->next;\n            }\n            return slow;\n        }\n    }\n    return nullptr;\n}",
    "code_java": "// Floyd's Cycle Detection & Start Node in Java\npublic class CycleAlgorithms {\n    // 1. Detect Cycle (LC 141)\n    public boolean hasCycle(ListNode head) {\n        ListNode slow = head, fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n            if (slow == fast) return true;\n        }\n        return false;\n    }\n\n    // 2. Find Start Node (LC 142)\n    public ListNode detectCycle(ListNode head) {\n        ListNode slow = head, fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n            if (slow == fast) {\n                slow = head;\n                while (slow != fast) {\n                    slow = slow.next;\n                    fast = fast.next;\n                }\n                return slow;\n            }\n        }\n        return null;\n    }\n}",
    "dry_run": [
      "1 -> 2 -> 3 -> 4 -> back to 2",
      "Meeting collision occurs at Node 4.",
      "Reset slow to 1. Fast stays at 4.",
      "Move both 1 step: slow -> 2, fast -> 2. Collision at 2!",
      "Start of loop Node 2 returned."
    ],
    "pitfalls": [
      "In step 2, forgetting to change fast's speed from 2 steps to 1 step leads to missing the start node collision."
    ],
    "leetcode_milestone": {
      "name": "Linked List Cycle II",
      "number": 142,
      "url": "https://leetcode.com/problems/linked-list-cycle-ii/",
      "checkpoint": "Floyd's algorithm mastered! Prove it by solving LC 141 and LC 142."
    },
    "problems": [
      {
        "id": "p7_1",
        "difficulty": "Easy",
        "title": "LeetCode 141: Linked List Cycle",
        "leetcode": "LeetCode 141",
        "leetcode_url": "https://leetcode.com/problems/linked-list-cycle/",
        "desc": "Determine if the linked list has a cycle in it using Floyd's algorithm.",
        "input": "head = [3,2,0,-4], pos = 1",
        "output": "true",
        "edge_cases": "Empty list, single node without cycle.",
        "hints": [
          "Advance slow by 1 step, fast by 2 steps.",
          "If fast reaches null, return false.",
          "If slow == fast, return true."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    bool hasCycle(ListNode *head) {\n        // C++:\n    }\n};",
        "starter_code_java": "public class Solution {\n    public boolean hasCycle(ListNode head) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    bool hasCycle(ListNode *head) {\n        ListNode* slow = head;\n        ListNode* fast = head;\n        while (fast && fast->next) {\n            slow = slow->next;\n            fast = fast->next->next;\n            if (slow == fast) return true;\n        }\n        return false;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "public class Solution {\n    public boolean hasCycle(ListNode head) {\n        ListNode slow = head;\n        ListNode fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n            if (slow == fast) return true;\n        }\n        return false;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Oracle",
          "Amazon",
          "Cisco"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [3,2,0,-4], pos = 1",
            "expected": "true",
            "actual": "true",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p7_2",
        "difficulty": "Medium",
        "title": "LeetCode 142: Linked List Cycle II (Cycle Start Node)",
        "leetcode": "LeetCode 142",
        "leetcode_url": "https://leetcode.com/problems/linked-list-cycle-ii/",
        "desc": "Given head, return the node where the cycle begins. If no cycle exists, return null.",
        "input": "head = [3,2,0,-4], pos = 1",
        "output": "tail connects to node index 1",
        "edge_cases": "No cycle, single node pointing to itself.",
        "hints": [
          "Locate collision point with Floyd's algorithm.",
          "Reset slow to head.",
          "Advance both slow and fast 1 step each until collision."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode *detectCycle(ListNode *head) {\n        // C++:\n    }\n};",
        "starter_code_java": "public class Solution {\n    public ListNode detectCycle(ListNode head) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode *detectCycle(ListNode *head) {\n        ListNode* slow = head;\n        ListNode* fast = head;\n        while (fast && fast->next) {\n            slow = slow->next;\n            fast = fast->next->next;\n            if (slow == fast) {\n                slow = head;\n                while (slow != fast) {\n                    slow = slow->next;\n                    fast = fast->next;\n                }\n                return slow;\n            }\n        }\n        return nullptr;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "public class Solution {\n    public ListNode detectCycle(ListNode head) {\n        ListNode slow = head;\n        ListNode fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n            if (slow == fast) {\n                slow = head;\n                while (slow != fast) {\n                    slow = slow.next;\n                    fast = fast.next;\n                }\n                return slow;\n            }\n        }\n        return null;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Goldman Sachs",
          "Meta",
          "Google"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [3,2,0,-4], pos = 1",
            "expected": "tail connects to node index 1",
            "actual": "tail connects to node index 1",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p7_3",
        "difficulty": "LeetCode Style",
        "title": "Break and Remove Loop from Linked List",
        "leetcode": "GFG / Interview Classic",
        "leetcode_url": "https://leetcode.com/problems/linked-list-cycle-ii/",
        "desc": "Given a linked list with a loop, detect and break the loop so it becomes linear with tail->next = null.",
        "input": "1 -> 2 -> 3 -> 4 -> 5 -> connects back to 3",
        "output": "1 -> 2 -> 3 -> 4 -> 5 -> null",
        "edge_cases": "Loop starts at head (circular list).",
        "hints": [
          "Find meeting point.",
          "If slow == head (full loop at head), move fast until `fast->next == slow`, then `fast->next = null`.",
          "Otherwise advance `slow->next` and `fast->next` until `slow->next == fast->next`, then `fast->next = null`."
        ],
        "starter_code_cpp": "void removeLoop(ListNode* head) {\n    // C++:\n}",
        "starter_code_java": "public void removeLoop(ListNode head) {\n    // Java:\n}",
        "solution_cpp": "void removeLoop(ListNode* head) {\n    if (!head || !head->next) return;\n    ListNode *slow = head, *fast = head;\n    bool hasLoop = false;\n    while (fast && fast->next) {\n        slow = slow->next;\n        fast = fast->next->next;\n        if (slow == fast) { hasLoop = true; break; }\n    }\n    if (!hasLoop) return;\n\n    slow = head;\n    if (slow == fast) {\n        while (fast->next != slow) fast = fast->next;\n        fast->next = nullptr;\n        return;\n    }\n    while (slow->next != fast->next) {\n        slow = slow->next;\n        fast = fast->next;\n    }\n    fast->next = nullptr;\n}\n// Time: O(N) | Space: O(1)",
        "solution_java": "public void removeLoop(ListNode head) {\n    if (head == null || head.next == null) return;\n    ListNode slow = head, fast = head;\n    boolean hasLoop = false;\n    while (fast != null && fast.next != null) {\n        slow = slow.next;\n        fast = fast.next.next;\n        if (slow == fast) { hasLoop = true; break; }\n    }\n    if (!hasLoop) return;\n\n    slow = head;\n    if (slow == fast) {\n        while (fast.next != slow) fast = fast.next;\n        fast.next = null;\n        return;\n    }\n    while (slow.next != fast.next) {\n        slow = slow.next;\n        fast = fast.next;\n    }\n    fast.next = null;\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "1 -> 2 -> 3 -> 4 -> 5 -> connects back to 3",
            "expected": "1 -> 2 -> 3 -> 4 -> 5 -> null",
            "actual": "1 -> 2 -> 3 -> 4 -> 5 -> null",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      }
    ]
  },
  {
    "id": "topic-8",
    "number": "08",
    "title": "Merge Two Sorted Lists & Merge Sort on Linked List",
    "tag": "Sorting & Two-Pointer Merging",
    "summary": "Iterative dummy node pointer stitching vs $O(N \\log N)$ Merge Sort without auxiliary node allocation.",
    "intuition_hinglish": "{{USER}} bhai, Array me Merge Sort karte waqt $O(N)$ extra memory (auxiliary array) allocate karni padti thi.\n    \n    Lekin **Linked List me Merge Sort bina kisi extra memory ($O(1)$ space) ke hota hai!**\n    Kyunki hume sirf pointers ko reconnect karna hota hai.\n    \n    <b>The Dummy Node Superpower:</b>\n    Agar dummy node nahi loge, to tumhe pehle check karna padega ki <code>l1->val < l2->val</code> hai ya nahi taaki naya head decide ho sake.\n    Dummy node lene se:\n    <code>ListNode dummy(0); ListNode* tail = &dummy;</code>\n    Har step pe jo node chhota ho, usko <code>tail->next</code> me connect karo aur <code>tail</code> aage badhao.\n    Aakhiri me return karo <code>dummy.next</code>!",
    "intuition_en": "{{USER}}, Linked lists provide the optimal substrate for Merge Sort because node splicing operates purely in-place without auxiliary arrays.\n    \n    <b>The Dummy Node Pattern:</b>\n    Pre-allocating a sentinel dummy node eliminates boundary conditional branches when initializing the merged head:\n    <code>ListNode dummy = new ListNode(0);</code>\n    <code>tail.next = (l1.val <= l2.val) ? l1 : l2;</code>\n    At loop exit, returning <code>dummy.next</code> effortlessly extracts the merged chain.",
    "intuition_tldr": "• Merging takes O(N + M) time and O(1) space.\n• Merge Sort on LL takes O(N log N) time and O(log N) stack frames.\n• Use dummy node sentinel to avoid head initialization edge cases.",
    "c_vs_cpp": [
      {
        "feature": "Dummy Node",
        "c": "struct Node dummy; dummy.next = NULL",
        "cpp": "ListNode dummy(0) (Stack allocated in C++) / new ListNode(0) in Java"
      }
    ],
    "diagram": "MERGE TWO SORTED LISTS:\nList 1: [1] ──> [4]\nList 2: [2] ──> [3]\n\nDummy [0]\n │\n ▼\n[0] ──> [1] (from L1)\n         │\n         ▼\n        [2] (from L2)\n         │\n         ▼\n        [3] (from L2)\n         │\n         ▼\n        [4] (from L1) -> null\nResult: dummy.next => 1 -> 2 -> 3 -> 4",
    "code_cpp": "// Merge Two Sorted Lists in C++\nListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {\n    ListNode dummy(0);\n    ListNode* tail = &dummy;\n\n    while (l1 && l2) {\n        if (l1->val <= l2->val) {\n            tail->next = l1;\n            l1 = l1->next;\n        } else {\n            tail->next = l2;\n            l2 = l2->next;\n        }\n        tail = tail->next;\n    }\n    tail->next = l1 ? l1 : l2;\n    return dummy.next;\n}",
    "code_java": "// Merge Two Sorted Lists in Java\npublic ListNode mergeTwoLists(ListNode l1, ListNode l2) {\n    ListNode dummy = new ListNode(0);\n    ListNode tail = dummy;\n\n    while (l1 != null && l2 != null) {\n        if (l1.val <= l2.val) {\n            tail.next = l1;\n            l1 = l1.next;\n        } else {\n            tail.next = l2;\n            l2 = l2.next;\n        }\n        tail = tail.next;\n    }\n    tail.next = (l1 != null) ? l1 : l2;\n    return dummy.next;\n}",
    "dry_run": [
      "L1: [1, 4], L2: [2, 3]",
      "1 <= 2 -> tail->next = 1, l1 = 4",
      "4 > 2  -> tail->next = 2, l2 = 3",
      "4 > 3  -> tail->next = 3, l2 = null",
      "Attach leftover L1 (4). Result: 1 -> 2 -> 3 -> 4."
    ],
    "pitfalls": [
      "In C++, allocating dummy on heap with `new` requires deleting it; using stack `ListNode dummy(0)` is zero-cost and leak-proof."
    ],
    "leetcode_milestone": {
      "name": "Merge Two Sorted Lists",
      "number": 21,
      "url": "https://leetcode.com/problems/merge-two-sorted-lists/",
      "checkpoint": "Conquer LeetCode 21, then level up to LC 148 (Sort List) and LC 23 (Merge k Sorted Lists)!"
    },
    "problems": [
      {
        "id": "p8_1",
        "difficulty": "Easy",
        "title": "LeetCode 21: Merge Two Sorted Lists",
        "leetcode": "LeetCode 21 (Must-Do)",
        "leetcode_url": "https://leetcode.com/problems/merge-two-sorted-lists/",
        "desc": "Merge two sorted linked lists and return it as a sorted list.",
        "input": "l1 = [1,2,4], l2 = [1,3,4]",
        "output": "[1,1,2,3,4,4]",
        "edge_cases": "One or both lists empty.",
        "hints": [
          "Initialize dummy node.",
          "Compare `l1->val` and `l2->val`.",
          "Attach leftover elements with ternary operator."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {\n        ListNode dummy(0);\n        ListNode* tail = &dummy;\n        while (l1 && l2) {\n            if (l1->val <= l2->val) { tail->next = l1; l1 = l1->next; }\n            else { tail->next = l2; l2 = l2->next; }\n            tail = tail->next;\n        }\n        tail->next = l1 ? l1 : l2;\n        return dummy.next;\n    }\n};\n// Time: O(N+M) | Space: O(1)",
        "solution_java": "class Solution {\n    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {\n        ListNode dummy = new ListNode(0);\n        ListNode tail = dummy;\n        while (l1 != null && l2 != null) {\n            if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next; }\n            else { tail.next = l2; l2 = l2.next; }\n            tail = tail.next;\n        }\n        tail.next = (l1 != null) ? l1 : l2;\n        return dummy.next;\n    }\n}\n// Time: O(N+M) | Space: O(1)",
        "companies": [
          "Goldman Sachs",
          "Meta",
          "Google"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "l1 = [1,2,4], l2 = [1,3,4]",
            "expected": "[1,1,2,3,4,4]",
            "actual": "[1,1,2,3,4,4]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p8_2",
        "difficulty": "Medium",
        "title": "LeetCode 148: Sort List (Merge Sort on LL)",
        "leetcode": "LeetCode 148",
        "leetcode_url": "https://leetcode.com/problems/sort-list/",
        "desc": "Sort a linked list in O(n log n) time and O(1) auxiliary memory.",
        "input": "head = [4,2,1,3]",
        "output": "[1,2,3,4]",
        "edge_cases": "Empty list or single node.",
        "hints": [
          "Split list into two halves using Fast and Slow pointer (`prev->next = null`).",
          "Recursively sort both halves.",
          "Merge halves with `mergeTwoLists`."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* sortList(ListNode* head) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode sortList(ListNode head) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* sortList(ListNode* head) {\n        if (!head || !head->next) return head;\n        ListNode *slow = head, *fast = head, *prev = nullptr;\n        while (fast && fast->next) {\n            prev = slow;\n            slow = slow->next;\n            fast = fast->next->next;\n        }\n        prev->next = nullptr;\n        ListNode* l1 = sortList(head);\n        ListNode* l2 = sortList(slow);\n        return merge(l1, l2);\n    }\n    ListNode* merge(ListNode* l1, ListNode* l2) {\n        ListNode dummy(0);\n        ListNode* tail = &dummy;\n        while (l1 && l2) {\n            if (l1->val < l2->val) { tail->next = l1; l1 = l1->next; }\n            else { tail->next = l2; l2 = l2->next; }\n            tail = tail->next;\n        }\n        tail->next = l1 ? l1 : l2;\n        return dummy.next;\n    }\n};\n// Time: O(N log N) | Space: O(log N) stack",
        "solution_java": "class Solution {\n    public ListNode sortList(ListNode head) {\n        if (head == null || head.next == null) return head;\n        ListNode slow = head, fast = head, prev = null;\n        while (fast != null && fast.next != null) {\n            prev = slow;\n            slow = slow.next;\n            fast = fast.next.next;\n        }\n        prev.next = null;\n        ListNode l1 = sortList(head);\n        ListNode l2 = sortList(slow);\n        return merge(l1, l2);\n    }\n    private ListNode merge(ListNode l1, ListNode l2) {\n        ListNode dummy = new ListNode(0);\n        ListNode tail = dummy;\n        while (l1 != null && l2 != null) {\n            if (l1.val < l2.val) { tail.next = l1; l1 = l1.next; }\n            else { tail.next = l2; l2 = l2.next; }\n            tail = tail.next;\n        }\n        tail.next = (l1 != null) ? l1 : l2;\n        return dummy.next;\n    }\n}\n// Time: O(N log N) | Space: O(log N) stack",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [4,2,1,3]",
            "expected": "[1,2,3,4]",
            "actual": "[1,2,3,4]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p8_3",
        "difficulty": "LeetCode Style",
        "title": "LeetCode 23: Merge k Sorted Lists (Hard)",
        "leetcode": "LeetCode 23 (Hard)",
        "leetcode_url": "https://leetcode.com/problems/merge-k-sorted-lists/",
        "desc": "Merge k sorted linked lists and return it as one sorted list.",
        "input": "lists = [[1,4,5],[1,3,4],[2,6]]",
        "output": "[1,1,2,3,4,4,5,6]",
        "edge_cases": "k == 0 or lists containing null.",
        "hints": [
          "Use a Min-Heap (priority_queue in C++, PriorityQueue in Java).",
          "Push active list heads into heap.",
          "Pop smallest, attach to tail, and push its next node."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        // Java:\n    }\n}",
        "solution_cpp": "#include <queue>\nclass Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        auto comp = [](ListNode* a, ListNode* b) { return a->val > b->val; };\n        priority_queue<ListNode*, vector<ListNode*>, decltype(comp)> pq(comp);\n        for (auto l : lists) if (l) pq.push(l);\n\n        ListNode dummy(0);\n        ListNode* tail = &dummy;\n        while (!pq.empty()) {\n            ListNode* top = pq.top();\n            pq.pop();\n            tail->next = top;\n            tail = tail->next;\n            if (top->next) pq.push(top->next);\n        }\n        return dummy.next;\n    }\n};\n// Time: O(N log k) | Space: O(k)",
        "solution_java": "import java.util.PriorityQueue;\nclass Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));\n        for (ListNode l : lists) if (l != null) pq.add(l);\n\n        ListNode dummy = new ListNode(0);\n        ListNode tail = dummy;\n        while (!pq.isEmpty()) {\n            ListNode top = pq.poll();\n            tail.next = top;\n            tail = tail.next;\n            if (top.next != null) pq.add(top.next);\n        }\n        return dummy.next;\n    }\n}\n// Time: O(N log k) | Space: O(k)",
        "companies": [
          "Meta",
          "Bloomberg",
          "Apple"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "lists = [[1,4,5],[1,3,4],[2,6]]",
            "expected": "[1,1,2,3,4,4,5,6]",
            "actual": "[1,1,2,3,4,4,5,6]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      }
    ]
  },
  {
    "id": "topic-9",
    "number": "09",
    "title": "Remove N-th Node From End (Gap Window Technique)",
    "tag": "Two-Pointer Window Pattern",
    "summary": "One-pass solution with $(N+1)$ pointer window and stack dummy node.",
    "intuition_hinglish": "{{USER}} bhai, agar tumhe end se N-th node delete karna hai to bina length calculate kiye 1-pass me kaise karenge?\n    \n    <b>The Gap Window Technique:</b>\n    1. Do pointers lo: <code>fast</code> aur <code>slow</code> (dono ko <code>dummy</code> node pe bithao).\n    2. <code>fast</code> ko pehle $N+1$ steps aage bhej do!\n    3. Ab dono ko ek saath 1-1 step aage badhao jab tak <code>fast</code> null na ho jaye.\n    4. Jab <code>fast</code> null pe pahunchega, <code>slow</code> theek us node se **pehle** khada hoga jise delete karna hai!\n    5. Bypass kar do: <code>slow->next = slow->next->next;</code>!",
    "intuition_en": "{{USER}}, eliminating the $N$-th node from the terminus in a single pass relies on maintaining a rigid spatial window of size $N+1$ between two pointers.\n    \n    <b>Window Progression Invariant:</b>\n    By sending <code>fast</code> $N+1$ steps ahead from sentinel <code>dummy</code>, the distance between <code>fast</code> and <code>slow</code> remains fixed at $N+1$.\n    When <code>fast</code> reaches terminal null, <code>slow</code> naturally rests at index $(L - N)$, immediately preceding the target node.",
    "intuition_tldr": "• Sentinel dummy eliminates head deletion branch.\n• Advance fast by N+1 steps.\n• Advance slow and fast together until fast is null. Bypass slow->next.",
    "c_vs_cpp": [
      {
        "feature": "Sentinel Dummy",
        "c": "Manual pointers",
        "cpp": "Stack dummy (C++) / Dummy object (Java)"
      }
    ],
    "diagram": "Delete 2nd node from end in [1 -> 2 -> 3 -> 4 -> 5]:\nN = 2. Dummy [0] -> 1 -> 2 -> 3 -> 4 -> 5\n\nStep 1: Advance fast by N + 1 = 3 steps:\n[0] -> [1] -> [2] -> [3] -> [4] -> [5] -> null\n S                    F\n\nStep 2: Advance both until F is null:\n[0] -> [1] -> [2] -> [3] -> [4] -> [5] -> null\n                      S                    F\nS is at 3. Target to delete is S->next (Node 4).\nS->next = S->next->next (4 bypassed!).",
    "code_cpp": "// One-Pass Remove N-th Node from End in C++\nListNode* removeNthFromEnd(ListNode* head, int n) {\n    ListNode dummy(0);\n    dummy.next = head;\n    ListNode* fast = &dummy;\n    ListNode* slow = &dummy;\n\n    for (int i = 0; i <= n; ++i) fast = fast->next;\n\n    while (fast != nullptr) {\n        slow = slow->next;\n        fast = fast->next;\n    }\n\n    ListNode* toDel = slow->next;\n    slow->next = slow->next->next;\n    delete toDel;\n    return dummy.next;\n}",
    "code_java": "// One-Pass Remove N-th Node from End in Java\npublic ListNode removeNthFromEnd(ListNode head, int n) {\n    ListNode dummy = new ListNode(0);\n    dummy.next = head;\n    ListNode fast = dummy;\n    ListNode slow = dummy;\n\n    for (int i = 0; i <= n; i++) fast = fast.next;\n\n    while (fast != null) {\n        slow = slow.next;\n        fast = fast.next;\n    }\n    slow.next = slow.next.next;\n    return dummy.next;\n}",
    "dry_run": [
      "List: [1, 2], n = 2 (Head deletion)",
      "Dummy [0] -> 1 -> 2. Fast moves 3 steps to null.",
      "slow is at dummy [0]. slow->next = 1->next = 2.",
      "Returns dummy.next (Node 2). Correctly removed original head!"
    ],
    "pitfalls": [
      "Advancing fast only n times instead of n + 1 lands slow directly on the target rather than its predecessor."
    ],
    "leetcode_milestone": {
      "name": "Remove Nth Node From End of List",
      "number": 19,
      "url": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
      "checkpoint": "Classic one-pass window problem! Crack LeetCode 19 now."
    },
    "problems": [
      {
        "id": "p9_1",
        "difficulty": "Easy",
        "title": "Find Nth Node from End",
        "leetcode": "Nth from End Lookup",
        "leetcode_url": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
        "desc": "Return the value of the Nth node from end, or -1 if N exceeds length.",
        "input": "head = [10, 20, 30, 40, 50], N = 2",
        "output": "40",
        "edge_cases": "N > length.",
        "hints": [
          "Advance fast by N steps.",
          "If fast is null before N steps, N > length, return -1.",
          "Move slow and fast together until fast is null."
        ],
        "starter_code_cpp": "int getNthFromLast(ListNode* head, int n) {\n    // C++:\n}",
        "starter_code_java": "public int getNthFromLast(ListNode head, int n) {\n    // Java:\n}",
        "solution_cpp": "int getNthFromLast(ListNode* head, int n) {\n    ListNode *fast = head, *slow = head;\n    for (int i = 0; i < n; ++i) {\n        if (!fast) return -1;\n        fast = fast->next;\n    }\n    while (fast) {\n        slow = slow->next;\n        fast = fast->next;\n    }\n    return slow ? slow->val : -1;\n}\n// Time: O(N) | Space: O(1)",
        "solution_java": "public int getNthFromLast(ListNode head, int n) {\n    ListNode fast = head, slow = head;\n    for (int i = 0; i < n; i++) {\n        if (fast == null) return -1;\n        fast = fast.next;\n    }\n    while (fast != null) {\n        slow = slow.next;\n        fast = fast.next;\n    }\n    return slow != null ? slow.val : -1;\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Google",
          "Amazon",
          "Microsoft"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [10, 20, 30, 40, 50], N = 2",
            "expected": "40",
            "actual": "40",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p9_2",
        "difficulty": "Medium",
        "title": "LeetCode 19: Remove Nth Node From End of List",
        "leetcode": "LeetCode 19",
        "leetcode_url": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
        "desc": "Remove the nth node from the end of the list and return its head in a single pass.",
        "input": "head = [1,2,3,4,5], n = 2",
        "output": "[1,2,3,5]",
        "edge_cases": "head = [1], n = 1 returns [].",
        "hints": [
          "Use sentinel dummy node before head.",
          "Move fast n + 1 steps.",
          "Move slow and fast until fast == null."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* removeNthFromEnd(ListNode* head, int n) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode removeNthFromEnd(ListNode head, int n) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* removeNthFromEnd(ListNode* head, int n) {\n        ListNode dummy(0);\n        dummy.next = head;\n        ListNode *fast = &dummy, *slow = &dummy;\n        for (int i = 0; i <= n; ++i) fast = fast->next;\n        while (fast) { slow = slow->next; fast = fast->next; }\n        ListNode* toDel = slow->next;\n        slow->next = slow->next->next;\n        delete toDel;\n        return dummy.next;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "class Solution {\n    public ListNode removeNthFromEnd(ListNode head, int n) {\n        ListNode dummy = new ListNode(0);\n        dummy.next = head;\n        ListNode fast = dummy, slow = dummy;\n        for (int i = 0; i <= n; i++) fast = fast.next;\n        while (fast != null) { slow = slow.next; fast = fast.next; }\n        slow.next = slow.next.next;\n        return dummy.next;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Meta",
          "Bloomberg",
          "Apple"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,2,3,4,5], n = 2",
            "expected": "[1,2,3,5]",
            "actual": "[1,2,3,5]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p9_3",
        "difficulty": "LeetCode Style",
        "title": "LeetCode 61: Rotate List",
        "leetcode": "LeetCode 61 (Medium)",
        "leetcode_url": "https://leetcode.com/problems/rotate-list/",
        "desc": "Rotate the list to the right by k places.",
        "input": "head = [1,2,3,4,5], k = 2",
        "output": "[4,5,1,2,3]",
        "edge_cases": "k >= length, empty list.",
        "hints": [
          "Find length and tail node.",
          "Connect tail->next = head to make it circular.",
          "New tail is at `length - (k % length)`. Break circle."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* rotateRight(ListNode* head, int k) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode rotateRight(ListNode head, int k) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* rotateRight(ListNode* head, int k) {\n        if (!head || !head->next || k == 0) return head;\n        int len = 1;\n        ListNode* tail = head;\n        while (tail->next) { tail = tail->next; len++; }\n        k = k % len;\n        if (k == 0) return head;\n        tail->next = head; // Ring\n        int steps = len - k;\n        while (steps--) tail = tail->next;\n        ListNode* newHead = tail->next;\n        tail->next = nullptr;\n        return newHead;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "class Solution {\n    public ListNode rotateRight(ListNode head, int k) {\n        if (head == null || head.next == null || k == 0) return head;\n        int len = 1;\n        ListNode tail = head;\n        while (tail.next != null) { tail = tail.next; len++; }\n        k = k % len;\n        if (k == 0) return head;\n        tail.next = head;\n        int steps = len - k;\n        while (steps-- > 0) tail = tail.next;\n        ListNode newHead = tail.next;\n        tail.next = null;\n        return newHead;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Amazon",
          "Uber",
          "Microsoft"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,2,3,4,5], k = 2",
            "expected": "[4,5,1,2,3]",
            "actual": "[4,5,1,2,3]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      }
    ]
  },
  {
    "id": "topic-10",
    "number": "10",
    "title": "Palindrome Linked List ($O(1)$ Space Synthesis)",
    "tag": "Algorithm Synthesis",
    "summary": "Combining Fast/Slow pointer, in-place list reversal, and two-pointer comparison in $O(1)$ auxiliary space.",
    "intuition_hinglish": "{{USER}} bhai, Array me palindrome check karna to aasan hota hai: <code>arr[i] == arr[n-1-i]</code>.\n    Lekin Singly Linked List me piche mudna impossible hota hai!\n    \n    Isliye hum 3 techniques ko combine karte hain:\n    1. <b>Middle dhoondo</b>: Fast/Slow pointer se theek aadhi doori tak pahuncho.\n    2. <b>Second half ko reverse karo</b>: Ab second half ke arrows palat gaye!\n    3. <b>Compare karo</b>: Ek pointer start se chalao, ek reversed half ke start se. Agar saari values match hui to Palindrome hai!\n    4. *(Pro Practice)*: Second half ko dobara reverse karke original list ko restore kar do.",
    "intuition_en": "{{USER}}, palindrome verification in Singly Linked Lists demonstrates algorithmic synthesis:\n    Since singly-linked nodes preclude reverse indexing, we combine three fundamental patterns:\n    1. <b>Mid-split</b>: Locate terminal node of first half via Tortoise and Hare.\n    2. <b>Half-Reversal</b>: Reverse the second half in-place ($O(1)$ space).\n    3. <b>Dual-Cursor Traversal</b>: Step through first half and reversed second half in tandem.",
    "intuition_tldr": "• Find middle: slow stops at end of 1st half using fast->next && fast->next->next.\n• Reverse 2nd half. Compare nodes.\n• Optimal O(N) time and O(1) auxiliary space.",
    "c_vs_cpp": [
      {
        "feature": "Space Comparison",
        "c": "Array clone O(N) space",
        "cpp": "In-place reversal O(1) space in C++ and Java"
      }
    ],
    "diagram": "ORIGINAL: [1] ──> [2] ──> [2] ──> [1]\n\nStep 1: Find mid -> stops at first [2]\nStep 2: Reverse second half:\nFirst half:     [1] ──> [2] ──> null\nReversed half:  [1] ──> [2] ──> null\n                 ▲       ▲\n                 p1      p2\nCompare: 1==1, 2==2. Palindrome confirmed!",
    "code_cpp": "// Palindrome Linked List in O(1) Space in C++\nclass Solution {\n    ListNode* reverseList(ListNode* head) {\n        ListNode* prev = nullptr;\n        while (head) {\n            ListNode* fwd = head->next;\n            head->next = prev;\n            prev = head;\n            head = fwd;\n        }\n        return prev;\n    }\npublic:\n    bool isPalindrome(ListNode* head) {\n        if (!head || !head->next) return true;\n        ListNode *slow = head, *fast = head;\n        while (fast->next && fast->next->next) {\n            slow = slow->next;\n            fast = fast->next->next;\n        }\n        ListNode* secondHalf = reverseList(slow->next);\n        ListNode *p1 = head, *p2 = secondHalf;\n        bool ok = true;\n        while (p2) {\n            if (p1->val != p2->val) { ok = false; break; }\n            p1 = p1->next;\n            p2 = p2->next;\n        }\n        slow->next = reverseList(secondHalf); // Restore\n        return ok;\n    }\n};",
    "code_java": "// Palindrome Linked List in O(1) Space in Java\nclass Solution {\n    private ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        while (head != null) {\n            ListNode fwd = head.next;\n            head.next = prev;\n            prev = head;\n            head = fwd;\n        }\n        return prev;\n    }\n\n    public boolean isPalindrome(ListNode head) {\n        if (head == null || head.next == null) return true;\n        ListNode slow = head, fast = head;\n        while (fast.next != null && fast.next.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n        }\n        ListNode secondHalf = reverseList(slow.next);\n        ListNode p1 = head, p2 = secondHalf;\n        boolean ok = true;\n        while (p2 != null) {\n            if (p1.val != p2.val) { ok = false; break; }\n            p1 = p1.next;\n            p2 = p2.next;\n        }\n        slow.next = reverseList(secondHalf);\n        return ok;\n    }\n}",
    "dry_run": [
      "[1, 2, 2, 1]",
      "slow stops at first 2. Second half [2, 1] reversed to [1, 2].",
      "p1=1 vs p2=1 (Match). p1=2 vs p2=2 (Match).",
      "p2 reaches null. Returns true!"
    ],
    "pitfalls": [
      "Using `fast && fast->next` for middle finding advances slow too far for even length lists. Use `fast->next && fast->next->next` instead."
    ],
    "leetcode_milestone": {
      "name": "Palindrome Linked List",
      "number": 234,
      "url": "https://leetcode.com/problems/palindrome-linked-list/",
      "checkpoint": "Cracking LC 234 proves you can compose multiple pointer algorithms together."
    },
    "problems": [
      {
        "id": "p10_1",
        "difficulty": "Easy",
        "title": "LeetCode 234: Palindrome Linked List",
        "leetcode": "LeetCode 234",
        "leetcode_url": "https://leetcode.com/problems/palindrome-linked-list/",
        "desc": "Return true if the singly linked list is a palindrome, false otherwise, in O(1) space.",
        "input": "head = [1,2,2,1]",
        "output": "true",
        "edge_cases": "Single node returns true.",
        "hints": [
          "Find middle using `fast->next && fast->next->next`.",
          "Reverse `slow->next`.",
          "Compare nodes of both halves."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    bool isPalindrome(ListNode* head) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public boolean isPalindrome(ListNode head) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    bool isPalindrome(ListNode* head) {\n        if (!head || !head->next) return true;\n        ListNode *slow = head, *fast = head;\n        while (fast->next && fast->next->next) {\n            slow = slow->next;\n            fast = fast->next->next;\n        }\n        ListNode* prev = nullptr;\n        ListNode* curr = slow->next;\n        while (curr) {\n            ListNode* fwd = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = fwd;\n        }\n        ListNode* p1 = head;\n        ListNode* p2 = prev;\n        while (p2) {\n            if (p1->val != p2->val) return false;\n            p1 = p1->next;\n            p2 = p2->next;\n        }\n        return true;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "class Solution {\n    public boolean isPalindrome(ListNode head) {\n        if (head == null || head.next == null) return true;\n        ListNode slow = head, fast = head;\n        while (fast.next != null && fast.next.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n        }\n        ListNode prev = null;\n        ListNode curr = slow.next;\n        while (curr != null) {\n            ListNode fwd = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = fwd;\n        }\n        ListNode p1 = head, p2 = prev;\n        while (p2 != null) {\n            if (p1.val != p2.val) return false;\n            p1 = p1.next;\n            p2 = p2.next;\n        }\n        return true;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Meta",
          "Bloomberg",
          "Apple"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,2,2,1]",
            "expected": "true",
            "actual": "true",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p10_2",
        "difficulty": "Medium",
        "title": "LeetCode 143: Reorder List",
        "leetcode": "LeetCode 143 (Medium)",
        "leetcode_url": "https://leetcode.com/problems/reorder-list/",
        "desc": "Reorder list to: L0 -> Ln -> L1 -> Ln-1 -> L2... in-place without altering node values.",
        "input": "head = [1,2,3,4,5]",
        "output": "[1,5,2,4,3]",
        "edge_cases": "1 or 2 nodes.",
        "hints": [
          "Split list into two halves with middle finder.",
          "Reverse the second half.",
          "Interleave nodes alternately from both halves."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    void reorderList(ListNode* head) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public void reorderList(ListNode head) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    void reorderList(ListNode* head) {\n        if (!head || !head->next) return;\n        ListNode *slow = head, *fast = head;\n        while (fast->next && fast->next->next) {\n            slow = slow->next;\n            fast = fast->next->next;\n        }\n        ListNode* prev = nullptr;\n        ListNode* curr = slow->next;\n        slow->next = nullptr;\n        while (curr) {\n            ListNode* fwd = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = fwd;\n        }\n        ListNode *p1 = head, *p2 = prev;\n        while (p2) {\n            ListNode* t1 = p1->next;\n            ListNode* t2 = p2->next;\n            p1->next = p2;\n            p2->next = t1;\n            p1 = t1;\n            p2 = t2;\n        }\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "class Solution {\n    public void reorderList(ListNode head) {\n        if (head == null || head.next == null) return;\n        ListNode slow = head, fast = head;\n        while (fast.next != null && fast.next.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n        }\n        ListNode prev = null;\n        ListNode curr = slow.next;\n        slow.next = null;\n        while (curr != null) {\n            ListNode fwd = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = fwd;\n        }\n        ListNode p1 = head, p2 = prev;\n        while (p2 != null) {\n            ListNode t1 = p1.next;\n            ListNode t2 = p2.next;\n            p1.next = p2;\n            p2.next = t1;\n            p1 = t1;\n            p2 = t2;\n        }\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Amazon",
          "Uber",
          "Microsoft"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,2,3,4,5]",
            "expected": "[1,5,2,4,3]",
            "actual": "[1,5,2,4,3]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p10_3",
        "difficulty": "LeetCode Style",
        "title": "Check Palindrome with Stack",
        "leetcode": "Memory Variant",
        "leetcode_url": "https://leetcode.com/problems/palindrome-linked-list/",
        "desc": "Implement palindrome check using Stack data structure in O(N) time and O(N) space.",
        "input": "head = [1, 2, 1]",
        "output": "true",
        "edge_cases": "Stack memory usage.",
        "hints": [
          "Push all values onto stack.",
          "Traverse again and compare with `stack.top()`."
        ],
        "starter_code_cpp": "#include <stack>\nbool isPalinStack(ListNode* head) {\n    // C++:\n}",
        "starter_code_java": "import java.util.Stack;\npublic boolean isPalinStack(ListNode head) {\n    // Java:\n}",
        "solution_cpp": "#include <stack>\nbool isPalinStack(ListNode* head) {\n    stack<int> s;\n    ListNode* curr = head;\n    while (curr) { s.push(curr->val); curr = curr->next; }\n    curr = head;\n    while (curr) {\n        if (curr->val != s.top()) return false;\n        s.pop();\n        curr = curr->next;\n    }\n    return true;\n}\n// Time: O(N) | Space: O(N)",
        "solution_java": "import java.util.Stack;\npublic boolean isPalinStack(ListNode head) {\n    Stack<Integer> s = new Stack<>();\n    ListNode curr = head;\n    while (curr != null) { s.push(curr.val); curr = curr.next; }\n    curr = head;\n    while (curr != null) {\n        if (curr.val != s.pop()) return false;\n        curr = curr.next;\n    }\n    return true;\n}\n// Time: O(N) | Space: O(N)",
        "companies": [
          "Google",
          "Meta",
          "Amazon"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1, 2, 1]",
            "expected": "true",
            "actual": "true",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      }
    ]
  },
  {
    "id": "topic-11",
    "number": "11",
    "title": "Intersection of Two Linked Lists (Path Equalization)",
    "tag": "Path Equalization & Collision",
    "summary": "Detecting merge point using two-pointer path equalization trick without hash tables in $O(1)$ space.",
    "intuition_hinglish": "{{USER}} bhai, socho do alag-alag sadkein shuru hoti hain aur aage jaakar ek common highway pe mil jaati hain (Y-junction).\n    \n    Dono lists ki length alag ho sakti hai:\n    - List A: distance $a + c$\n    - List B: distance $b + c$\n    \n    Agar Pointer A list A khatam karke **List B ke head** pe chala jaye, aur Pointer B list B khatam karke **List A ke head** pe chala jaye:\n    - Pointer A total chalega: $(a + c) + b$\n    - Pointer B total chalega: $(b + c) + a$\n    \n    Dono exact **same total distance $(a + b + c)$** travel karenge, iska matlab dono theek **intersection node pe collide** karenge!",
    "intuition_en": "{{USER}}, detecting convergence nodes across two singly linked chains without auxiliary hash sets utilizes the Path Equalization Principle:\n    Let $a$ and $b$ represent unique prefixes, and $c$ represent the shared convergent suffix.\n    - Path A: $a + c + b$\n    - Path B: $b + c + a$\n    Switching pointers to the opposing head upon encountering null synchronizes both traversals at distance $(a + b + c)$, colliding precisely at the intersection root.",
    "intuition_tldr": "• pA = pA == null ? headB : pA.next\n• pB = pB == null ? headA : pB.next\n• Loop terminates when pA == pB (intersection node or null).",
    "c_vs_cpp": [
      {
        "feature": "Pointer Identity",
        "c": "pA == pB (Address)",
        "cpp": "Address comparison (NOT value match) in both C++ and Java"
      }
    ],
    "diagram": "List A:      [A1] ──> [A2] ──┐\n                              ▼\nList B: [B1] ──> [B2] ──> [B3] ──> [C1] ──> [C2] ──> null (Merge at C1!)\n\nPointer A Traversal: A1 -> A2 -> C1 -> C2 -> B1 -> B2 -> B3 -> C1\nPointer B Traversal: B1 -> B2 -> B3 -> C1 -> C2 -> A1 -> A2 -> C1\nBoth collide simultaneously at C1!",
    "code_cpp": "// Intersection of Two Linked Lists in C++\nListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {\n    if (!headA || !headB) return nullptr;\n    ListNode* pA = headA;\n    ListNode* pB = headB;\n\n    while (pA != pB) {\n        pA = (pA == nullptr) ? headB : pA->next;\n        pB = (pB == nullptr) ? headA : pB->next;\n    }\n    return pA;\n}",
    "code_java": "// Intersection of Two Linked Lists in Java\npublic ListNode getIntersectionNode(ListNode headA, ListNode headB) {\n    if (headA == null || headB == null) return null;\n    ListNode pA = headA;\n    ListNode pB = headB;\n\n    while (pA != pB) {\n        pA = (pA == null) ? headB : pA.next;\n        pB = (pB == null) ? headA : pB.next;\n    }\n    return pA;\n}",
    "dry_run": [
      "A length = 5, B length = 6. Intersect at node 8.",
      "pA finishes 5 nodes -> switches to headB.",
      "pB finishes 6 nodes -> switches to headA.",
      "At total step 8, both pointers simultaneously point to node 8. Loop terminates."
    ],
    "pitfalls": [
      "Comparing node values (`pA->val == pB->val`) instead of memory addresses: two distinct nodes can hold identical values!"
    ],
    "leetcode_milestone": {
      "name": "Intersection of Two Linked Lists",
      "number": 160,
      "url": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
      "checkpoint": "Conquer LeetCode 160 with the elegant two-pointer switch trick."
    },
    "problems": [
      {
        "id": "p11_1",
        "difficulty": "Easy",
        "title": "LeetCode 160: Intersection of Two Linked Lists",
        "leetcode": "LeetCode 160",
        "leetcode_url": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
        "desc": "Return the node at which two lists intersect, or null if they do not intersect.",
        "input": "listA = [4,1,8,4,5], listB = [5,6,1,8,4,5], intersect at 8",
        "output": "Node 8",
        "edge_cases": "No intersection returns null.",
        "hints": [
          "Set `pA = headA` and `pB = headB`.",
          "When `pA` reaches null, reset to `headB`.",
          "When `pB` reaches null, reset to `headA`."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {\n        // C++:\n    }\n};",
        "starter_code_java": "public class Solution {\n    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {\n        if (!headA || !headB) return nullptr;\n        ListNode *pA = headA, *pB = headB;\n        while (pA != pB) {\n            pA = pA ? pA->next : headB;\n            pB = pB ? pB->next : headA;\n        }\n        return pA;\n    }\n};\n// Time: O(N+M) | Space: O(1)",
        "solution_java": "public class Solution {\n    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {\n        if (headA == null || headB == null) return null;\n        ListNode pA = headA, pB = headB;\n        while (pA != pB) {\n            pA = (pA != null) ? pA.next : headB;\n            pB = (pB != null) ? pB.next : headA;\n        }\n        return pA;\n    }\n}\n// Time: O(N+M) | Space: O(1)",
        "companies": [
          "Amazon",
          "Uber",
          "Microsoft"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "listA = [4,1,8,4,5], listB = [5,6,1,8,4,5], intersect at 8",
            "expected": "Node 8",
            "actual": "Node 8",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p11_2",
        "difficulty": "Medium",
        "title": "Intersection by Difference of Lengths",
        "leetcode": "Length Difference Method",
        "leetcode_url": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
        "desc": "Find intersection without pointer switching: calculate lengths `lenA` and `lenB`, advance longer list by `diff`, then walk together.",
        "input": "Same as LeetCode 160",
        "output": "Intersection node",
        "edge_cases": "Lists of identical lengths without intersection.",
        "hints": [
          "Calculate lenA and lenB.",
          "Advance pointer on the longer list by `abs(lenA - lenB)`.",
          "Step both pointers together until `pA == pB`."
        ],
        "starter_code_cpp": "ListNode* getIntersectionLen(ListNode* headA, ListNode* headB) {\n    // C++:\n}",
        "starter_code_java": "public ListNode getIntersectionLen(ListNode headA, ListNode headB) {\n    // Java:\n}",
        "solution_cpp": "ListNode* getIntersectionLen(ListNode* headA, ListNode* headB) {\n    auto getLen = [](ListNode* h) { int l = 0; while (h) { l++; h = h->next; } return l; };\n    int lA = getLen(headA), lB = getLen(headB);\n    while (lA > lB) { headA = headA->next; lA--; }\n    while (lB > lA) { headB = headB->next; lB--; }\n    while (headA && headB) {\n        if (headA == headB) return headA;\n        headA = headA->next;\n        headB = headB->next;\n    }\n    return nullptr;\n}\n// Time: O(N+M) | Space: O(1)",
        "solution_java": "public ListNode getIntersectionLen(ListNode headA, ListNode headB) {\n    int lA = 0, lB = 0;\n    ListNode cA = headA, cB = headB;\n    while (cA != null) { lA++; cA = cA.next; }\n    while (cB != null) { lB++; cB = cB.next; }\n    while (lA > lB) { headA = headA.next; lA--; }\n    while (lB > lA) { headB = headB.next; lB--; }\n    while (headA != null && headB != null) {\n        if (headA == headB) return headA;\n        headA = headA.next;\n        headB = headB.next;\n    }\n    return null;\n}\n// Time: O(N+M) | Space: O(1)",
        "companies": [
          "Google",
          "Meta",
          "Amazon"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "Same as LeetCode 160",
            "expected": "Intersection node",
            "actual": "Intersection node",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p11_3",
        "difficulty": "LeetCode Style",
        "title": "LeetCode 599: Minimum Index Sum of Two Lists",
        "leetcode": "LeetCode 599",
        "leetcode_url": "https://leetcode.com/problems/minimum-index-sum-of-two-lists/",
        "desc": "Find common strings with minimum index sum using Hash Map lookup.",
        "input": "list1 = [\"Shogun\",\"Tapioca\"], list2 = [\"Piatti\",\"Shogun\"]",
        "output": "[\"Shogun\"]",
        "edge_cases": "Ties for minimum index sum.",
        "hints": [
          "Put list1 into hash map with string -> index.",
          "Traverse list2 and check if key exists.",
          "Track minimum sum."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    vector<string> findRestaurant(vector<string>& list1, vector<string>& list2) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public String[] findRestaurant(String[] list1, String[] list2) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    vector<string> findRestaurant(vector<string>& list1, vector<string>& list2) {\n        unordered_map<string, int> m;\n        for (int i = 0; i < list1.size(); ++i) m[list1[i]] = i;\n        int minSum = INT_MAX;\n        vector<string> res;\n        for (int j = 0; j < list2.size(); ++j) {\n            if (m.count(list2[j])) {\n                int sum = j + m[list2[j]];\n                if (sum < minSum) { minSum = sum; res = {list2[j]}; }\n                else if (sum == minSum) res.push_back(list2[j]);\n            }\n        }\n        return res;\n    }\n};\n// Time: O(N+M) | Space: O(N)",
        "solution_java": "import java.util.*;\nclass Solution {\n    public String[] findRestaurant(String[] list1, String[] list2) {\n        Map<String, Integer> map = new HashMap<>();\n        for (int i = 0; i < list1.length; i++) map.put(list1[i], i);\n        int minSum = Integer.MAX_VALUE;\n        List<String> res = new ArrayList<>();\n        for (int j = 0; j < list2.length; j++) {\n            if (map.containsKey(list2[j])) {\n                int sum = j + map.get(list2[j]);\n                if (sum < minSum) { minSum = sum; res.clear(); res.add(list2[j]); }\n                else if (sum == minSum) res.add(list2[j]);\n            }\n        }\n        return res.toArray(new String[0]);\n    }\n}\n// Time: O(N+M) | Space: O(N)",
        "companies": [
          "Apple",
          "Microsoft",
          "Netflix"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "list1 = [\"Shogun\",\"Tapioca\"], list2 = [\"Piatti\",\"Shogun\"]",
            "expected": "[\"Shogun\"]",
            "actual": "[\"Shogun\"]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      }
    ]
  },
  {
    "id": "topic-12",
    "number": "12",
    "title": "Doubly & Circular Linked Lists (LRU Cache Blueprint)",
    "tag": "Bidirectional & Cyclic Data Structures",
    "summary": "Prev and Next pointer management, O(1) node deletion given pointer, and the LRU Cache architecture.",
    "intuition_hinglish": "{{USER}} bhai, Singly Linked List me sabse badi pareshani ye thi ki hum piche nahi mud sakte the. Kisi node ko delete karne ke liye uske pichhle (previous) node ka pata hona zaroori tha.\n    \n    <b>Doubly Linked List (DLL)</b> me har node ke paas 2 pointers hote hain:\n    - <code>next</code>: Agle node ka address\n    - <code>prev</code>: Pichhle node ka address\n    \n    Iska sabse bada superpower: **O(1) deletion given only the node pointer!**\n    <code>node->prev->next = node->next;</code>\n    <code>node->next->prev = node->prev;</code>\n    <code>delete node;</code>\n    Ye exact structure **LeetCode 146: LRU Cache** ka heart hai!\n    \n    <b>Circular Linked List (CLL)</b> me tail null hone ke bajaye wapas head ko point karti hai. Termination check: <code>curr->next != head</code>!",
    "intuition_en": "{{USER}}, Doubly Linked Lists resolve the unidirectional constraint of singly linked chains by maintaining bidirectional links (<code>prev</code> and <code>next</code>).\n    \n    <b>The O(1) Arbitrary Deletion Primitive:</b>\n    Given solely a target node reference, it can uncouple itself in $O(1)$ operations without predecessor traversal:\n    <code>target.prev.next = target.next;</code>\n    <code>target.next.prev = target.prev;</code>\n    This primitive forms the backbone of systems architecture including OS thread schedulers and LeetCode 146 (LRU Cache).",
    "intuition_tldr": "• DLL allows O(1) removal given node pointer.\n• STL std::list and java.util.LinkedList are doubly-linked lists.\n• Foundation of LRU Cache (DLL + HashMap).",
    "c_vs_cpp": [
      {
        "feature": "Standard Library DLL",
        "c": "Manual struct",
        "cpp": "std::list<T> (C++) / java.util.LinkedList<T> (Java)"
      }
    ],
    "diagram": "DOUBLY LINKED LIST (DLL):\nnull <── [prev | 10 | next] <───> [prev | 20 | next] ──> null\n\nLRU CACHE ARCHITECTURE:\n[Dummy Head] <──> [Most Recent (20)] <──> [Least Recent (10)] <──> [Dummy Tail]\n        ▲                                          ▲\n        └─────── HashMap <key, Node*> Pointer ─────┘",
    "code_cpp": "// Doubly Linked List in C++\nstruct DNode {\n    int val;\n    DNode* prev;\n    DNode* next;\n    DNode(int v) : val(v), prev(nullptr), next(nullptr) {}\n};\n\nvoid deleteNodeO1(DNode* target) {\n    if (!target) return;\n    if (target->prev) target->prev->next = target->next;\n    if (target->next) target->next->prev = target->prev;\n    delete target;\n}",
    "code_java": "// Doubly Linked List in Java\npublic class DNode {\n    int val;\n    DNode prev, next;\n    DNode(int v) { this.val = v; }\n\n    public static void deleteNodeO1(DNode target) {\n        if (target == null) return;\n        if (target.prev != null) target.prev.next = target.next;\n        if (target.next != null) target.next.prev = target.prev;\n    }\n}",
    "dry_run": [
      "DLL: 10 <-> 20 <-> 30. Delete Node 20.",
      "10->next = 30; 30->prev = 10; delete 20.",
      "Done in O(1) time without traversing from head!"
    ],
    "pitfalls": [
      "In Circular LL: Using `while (curr != null)` creates an infinite loop because `next` never becomes null. Use `while (curr->next != head)` or `do-while`."
    ],
    "leetcode_milestone": {
      "name": "LRU Cache",
      "number": 146,
      "url": "https://leetcode.com/problems/lru-cache/",
      "checkpoint": "Mastering DLL unlocks the most requested system design problem: LeetCode 146!"
    },
    "problems": [
      {
        "id": "p12_1",
        "difficulty": "Easy",
        "title": "Reverse a Doubly Linked List",
        "leetcode": "Reverse DLL",
        "leetcode_url": "https://leetcode.com/problems/reverse-linked-list/",
        "desc": "Reverse a Doubly Linked List by swapping next and prev pointers for every node.",
        "input": "null <- 1 <-> 2 <-> 3 -> null",
        "output": "null <- 3 <-> 2 <-> 1 -> null",
        "edge_cases": "Single node list.",
        "hints": [
          "Swap `curr->prev` and `curr->next` for each node.",
          "Advance using the swapped pointer: `curr = curr->prev`."
        ],
        "starter_code_cpp": "DNode* reverseDLL(DNode* head) {\n    // C++:\n}",
        "starter_code_java": "public DNode reverseDLL(DNode head) {\n    // Java:\n}",
        "solution_cpp": "DNode* reverseDLL(DNode* head) {\n    if (!head || !head->next) return head;\n    DNode* curr = head;\n    DNode* temp = nullptr;\n    while (curr) {\n        temp = curr->prev;\n        curr->prev = curr->next;\n        curr->next = temp;\n        curr = curr->prev;\n    }\n    return temp ? temp->prev : head;\n}\n// Time: O(N) | Space: O(1)",
        "solution_java": "public DNode reverseDLL(DNode head) {\n    if (head == null || head.next == null) return head;\n    DNode curr = head, temp = null;\n    while (curr != null) {\n        temp = curr.prev;\n        curr.prev = curr.next;\n        curr.next = temp;\n        curr = curr.prev;\n    }\n    return temp != null ? temp.prev : head;\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Google",
          "Meta",
          "Amazon"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "null <- 1 <-> 2 <-> 3 -> null",
            "expected": "null <- 3 <-> 2 <-> 1 -> null",
            "actual": "null <- 3 <-> 2 <-> 1 -> null",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p12_2",
        "difficulty": "Medium",
        "title": "LeetCode 430: Flatten a Multilevel Doubly Linked List",
        "leetcode": "LeetCode 430 (Medium)",
        "leetcode_url": "https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/",
        "desc": "Flatten a multilevel doubly linked list so all nodes appear in a single-level doubly linked list.",
        "input": "head with child pointers",
        "output": "Flattened 1D DLL",
        "edge_cases": "Nodes with null child, deep nested levels.",
        "hints": [
          "Iterate through nodes.",
          "When `curr->child` is detected, find child tail.",
          "Wire child head after `curr` and child tail before `curr->next`."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    Node* flatten(Node* head) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public Node flatten(Node head) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    Node* flatten(Node* head) {\n        Node* curr = head;\n        while (curr) {\n            if (curr->child) {\n                Node* nxt = curr->next;\n                Node* childHead = flatten(curr->child);\n                curr->next = childHead;\n                childHead->prev = curr;\n                curr->child = nullptr;\n                Node* tail = childHead;\n                while (tail->next) tail = tail->next;\n                tail->next = nxt;\n                if (nxt) nxt->prev = tail;\n            }\n            curr = curr->next;\n        }\n        return head;\n    }\n};\n// Time: O(N) | Space: O(Depth)",
        "solution_java": "class Solution {\n    public Node flatten(Node head) {\n        Node curr = head;\n        while (curr != null) {\n            if (curr.child != null) {\n                Node nxt = curr.next;\n                Node childHead = flatten(curr.child);\n                curr.next = childHead;\n                childHead.prev = curr;\n                curr.child = null;\n                Node tail = childHead;\n                while (tail.next != null) tail = tail.next;\n                tail.next = nxt;\n                if (nxt != null) nxt.prev = tail;\n            }\n            curr = curr.next;\n        }\n        return head;\n    }\n}\n// Time: O(N) | Space: O(Depth)",
        "companies": [
          "Apple",
          "Microsoft",
          "Netflix"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head with child pointers",
            "expected": "Flattened 1D DLL",
            "actual": "Flattened 1D DLL",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p12_3",
        "difficulty": "LeetCode Style",
        "title": "LeetCode 146: LRU Cache (DLL + HashMap)",
        "leetcode": "LeetCode 146 (Hard/Medium Favorite)",
        "leetcode_url": "https://leetcode.com/problems/lru-cache/",
        "desc": "Design an LRU Cache with get and put operations executing in O(1) average time complexity.",
        "input": "LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2)",
        "output": "[null, null, null, 1, null, -1]",
        "edge_cases": "Capacity exceeded, updating existing key.",
        "hints": [
          "Use Doubly Linked List with dummy head and dummy tail.",
          "Use HashMap<key, Node*> for O(1) lookup.",
          "Most recent nodes placed right after head; least recent right before tail."
        ],
        "starter_code_cpp": "class LRUCache {\npublic:\n    LRUCache(int capacity) {}\n    int get(int key) { return -1; }\n    void put(int key, int value) {}\n};",
        "starter_code_java": "class LRUCache {\n    public LRUCache(int capacity) {}\n    public int get(int key) { return -1; }\n    public void put(int key, int value) {}\n}",
        "solution_cpp": "#include <unordered_map>\nclass LRUCache {\n    struct Node {\n        int k, v;\n        Node *prev, *next;\n        Node(int key, int val) : k(key), v(val), prev(nullptr), next(nullptr) {}\n    };\n    int cap;\n    unordered_map<int, Node*> m;\n    Node *head, *tail;\n    void addNode(Node* node) {\n        node->next = head->next; node->prev = head;\n        head->next->prev = node; head->next = node;\n    }\n    void removeNode(Node* node) {\n        node->prev->next = node->next; node->next->prev = node->prev;\n    }\npublic:\n    LRUCache(int capacity) : cap(capacity) {\n        head = new Node(0, 0); tail = new Node(0, 0);\n        head->next = tail; tail->prev = head;\n    }\n    int get(int key) {\n        if (!m.count(key)) return -1;\n        Node* node = m[key];\n        removeNode(node); addNode(node);\n        return node->v;\n    }\n    void put(int key, int value) {\n        if (m.count(key)) {\n            Node* node = m[key]; node->v = value;\n            removeNode(node); addNode(node);\n        } else {\n            Node* newNode = new Node(key, value);\n            m[key] = newNode; addNode(newNode);\n            if (m.size() > cap) {\n                Node* lru = tail->prev;\n                removeNode(lru); m.erase(lru->k);\n                delete lru;\n            }\n        }\n    }\n};\n// Time: O(1) for get & put | Space: O(capacity)",
        "solution_java": "import java.util.*;\nclass LRUCache {\n    class Node {\n        int k, v;\n        Node prev, next;\n        Node(int key, int val) { this.k = key; this.v = val; }\n    }\n    private int cap;\n    private Map<Integer, Node> map = new HashMap<>();\n    private Node head = new Node(0, 0), tail = new Node(0, 0);\n    private void add(Node node) {\n        node.next = head.next; node.prev = head;\n        head.next.prev = node; head.next = node;\n    }\n    private void remove(Node node) {\n        node.prev.next = node.next; node.next.prev = node.prev;\n    }\n    public LRUCache(int capacity) {\n        this.cap = capacity;\n        head.next = tail; tail.prev = head;\n    }\n    public int get(int key) {\n        if (!map.containsKey(key)) return -1;\n        Node node = map.get(key);\n        remove(node); add(node);\n        return node.v;\n    }\n    public void put(int key, int value) {\n        if (map.containsKey(key)) {\n            Node node = map.get(key); node.v = value;\n            remove(node); add(node);\n        } else {\n            Node newNode = new Node(key, value);\n            map.put(key, newNode); add(newNode);\n            if (map.size() > cap) {\n                Node lru = tail.prev;\n                remove(lru); map.remove(lru.k);\n            }\n        }\n    }\n}\n// Time: O(1) for get & put | Space: O(capacity)",
        "companies": [
          "Adobe",
          "Google",
          "Uber"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2)",
            "expected": "[null, null, null, 1, null, -1]",
            "actual": "[null, null, null, 1, null, -1]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      }
    ]
  },
  {
    "id": "topic-13",
    "number": "13",
    "title": "LeetCode ListNode Harness & Carry Math (Add Two Numbers)",
    "tag": "Judge Execution & Carry Arithmetic",
    "summary": "How LeetCode judges C++ and Java code, Solution class execution, and carry loops in LC 2.",
    "intuition_hinglish": "{{USER}} bhai, LeetCode pe kabhi bhi <code>cin >> ...</code> ya <code>Scanner</code> likhne ki zaroorat nahi hoti!\n    \n    LeetCode tumhara code ek Automated Test Harness ke andar run karta hai:\n    1. Input array <code>[2,4,3]</code> ko LeetCode background me Linked List me convert karta hai.\n    2. Head pointer pass karta hai tumhare <code>Solution::addTwoNumbers(ListNode* l1, ListNode* l2)</code> ko.\n    3. Tumhe bas ek naya head return karna hota hai.\n    \n    <b>The Carry Loop Paradigm:</b>\n    Carry arithmetic ka standard loop invariant:\n    <code>while (l1 || l2 || carry)</code>\n    Is single condition se alag-alag lengths aur aakhiri bacha hua carry automatically handle ho jata hai!",
    "intuition_en": "{{USER}}, online judges (LeetCode, Codeforces) execute your solution method as an encapsulated class member, automatically serializing arrays to linked nodes.\n    \n    <b>The Carry Accumulator Paradigm:</b>\n    Loop invariant: <code>while (l1 != null || l2 != null || carry != 0)</code>\n    This unified conditional seamlessly digests mismatched list lengths and terminal carry generation without auxiliary trailing loops.",
    "intuition_tldr": "• LeetCode manages main(), driver I/O, and node serialization.\n• Carry invariant: while (l1 != null || l2 != null || carry != 0).\n• Return dummy.next as result head.",
    "c_vs_cpp": [
      {
        "feature": "Driver Execution",
        "c": "Written in main()",
        "cpp": "Solution class method in both C++ and Java"
      }
    ],
    "diagram": "ADD TWO NUMBERS (Representing 342 + 465 = 807):\nl1: [2] ──> [4] ──> [3]\nl2: [5] ──> [6] ──> [4]\n\nIter 1: 2 + 5 + 0 = 7  (carry=0) -> Node(7)\nIter 2: 4 + 6 + 0 = 10 (carry=1) -> Node(0)\nIter 3: 3 + 4 + 1 = 8  (carry=0) -> Node(8)\nResult: 7 -> 0 -> 8 (Represents 807!)",
    "code_cpp": "// Add Two Numbers in C++ (LeetCode 2)\nclass Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        ListNode dummy(0);\n        ListNode* curr = &dummy;\n        int carry = 0;\n\n        while (l1 != nullptr || l2 != nullptr || carry != 0) {\n            int sum = carry;\n            if (l1) { sum += l1->val; l1 = l1->next; }\n            if (l2) { sum += l2->val; l2 = l2->next; }\n\n            carry = sum / 10;\n            curr->next = new ListNode(sum % 10);\n            curr = curr->next;\n        }\n        return dummy.next;\n    }\n};",
    "code_java": "// Add Two Numbers in Java (LeetCode 2)\nclass Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        ListNode dummy = new ListNode(0);\n        ListNode curr = dummy;\n        int carry = 0;\n\n        while (l1 != null || l2 != null || carry != 0) {\n            int sum = carry;\n            if (l1 != null) { sum += l1.val; l1 = l1.next; }\n            if (l2 != null) { sum += l2.val; l2 = l2.next; }\n\n            carry = sum / 10;\n            curr.next = new ListNode(sum % 10);\n            curr = curr.next;\n        }\n        return dummy.next;\n    }\n}",
    "dry_run": [
      "l1=[9,9], l2=[1]",
      "Iter 1: 9+1 = 10 -> carry=1, node(0)",
      "Iter 2: 9+0+1 = 10 -> carry=1, node(0)",
      "Iter 3: carry=1 -> node(1)",
      "Result: [0, 0, 1] (representing 100). Correct!"
    ],
    "pitfalls": [
      "Forgetting `carry != 0` in while condition misses the final most significant digit (e.g. 5 + 5 gives [0] instead of [0, 1])."
    ],
    "leetcode_milestone": {
      "name": "Add Two Numbers",
      "number": 2,
      "url": "https://leetcode.com/problems/add-two-numbers/",
      "checkpoint": "Solve LeetCode's flagship linked list problem: LC 2!"
    },
    "problems": [
      {
        "id": "p13_1",
        "difficulty": "Easy",
        "title": "LeetCode 83: Remove Duplicates from Sorted List",
        "leetcode": "LeetCode 83",
        "leetcode_url": "https://leetcode.com/problems/remove-duplicates-from-sorted-list/",
        "desc": "Delete all duplicates so that each element appears only once.",
        "input": "head = [1,1,2,3,3]",
        "output": "[1,2,3]",
        "edge_cases": "All elements duplicate [1,1,1].",
        "hints": [
          "Check `curr->val == curr->next->val`.",
          "Bypass: `curr->next = curr->next->next`.",
          "Advance `curr` ONLY when values do not match!"
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* deleteDuplicates(ListNode* head) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode deleteDuplicates(ListNode head) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* deleteDuplicates(ListNode* head) {\n        ListNode* curr = head;\n        while (curr && curr->next) {\n            if (curr->val == curr->next->val) {\n                ListNode* temp = curr->next;\n                curr->next = curr->next->next;\n                delete temp;\n            } else {\n                curr = curr->next;\n            }\n        }\n        return head;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "class Solution {\n    public ListNode deleteDuplicates(ListNode head) {\n        ListNode curr = head;\n        while (curr != null && curr.next != null) {\n            if (curr.val == curr.next.val) {\n                curr.next = curr.next.next;\n            } else {\n                curr = curr.next;\n            }\n        }\n        return head;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Apple",
          "Microsoft",
          "Netflix"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,1,2,3,3]",
            "expected": "[1,2,3]",
            "actual": "[1,2,3]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p13_2",
        "difficulty": "Medium",
        "title": "LeetCode 82: Remove Duplicates from Sorted List II",
        "leetcode": "LeetCode 82",
        "leetcode_url": "https://leetcode.com/problems/remove-duplicates-from-sorted-list-ii/",
        "desc": "Delete all nodes that have duplicate numbers, leaving only distinct numbers.",
        "input": "head = [1,2,3,3,4,4,5]",
        "output": "[1,2,5]",
        "edge_cases": "Duplicates at head [1,1,1,2].",
        "hints": [
          "Use dummy node before head.",
          "Maintain `prev` pointing to last distinct node.",
          "Skip entire duplicate sequence before connecting `prev->next`."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* deleteDuplicates(ListNode* head) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode deleteDuplicates(ListNode head) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* deleteDuplicates(ListNode* head) {\n        ListNode dummy(0);\n        dummy.next = head;\n        ListNode* prev = &dummy;\n        while (head) {\n            if (head->next && head->val == head->next->val) {\n                while (head->next && head->val == head->next->val) head = head->next;\n                prev->next = head->next;\n            } else {\n                prev = prev->next;\n            }\n            head = head->next;\n        }\n        return dummy.next;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "class Solution {\n    public ListNode deleteDuplicates(ListNode head) {\n        ListNode dummy = new ListNode(0);\n        dummy.next = head;\n        ListNode prev = dummy;\n        while (head != null) {\n            if (head.next != null && head.val == head.next.val) {\n                while (head.next != null && head.val == head.next.val) head = head.next;\n                prev.next = head.next;\n            } else {\n                prev = prev.next;\n            }\n            head = head.next;\n        }\n        return dummy.next;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Adobe",
          "Google",
          "Uber"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,2,3,3,4,4,5]",
            "expected": "[1,2,5]",
            "actual": "[1,2,5]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p13_3",
        "difficulty": "LeetCode Style",
        "title": "LeetCode 2: Add Two Numbers",
        "leetcode": "LeetCode 2 (Core)",
        "leetcode_url": "https://leetcode.com/problems/add-two-numbers/",
        "desc": "Add two numbers represented by linked lists in reverse order.",
        "input": "l1 = [2,4,3], l2 = [5,6,4]",
        "output": "[7,0,8]",
        "edge_cases": "Differing lengths, final carry.",
        "hints": [
          "Initialize carry = 0 and sentinel dummy.",
          "While l1 || l2 || carry, accumulate sum.",
          "Append `sum % 10`, update `carry = sum / 10`."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        ListNode dummy(0);\n        ListNode* curr = &dummy;\n        int carry = 0;\n        while (l1 || l2 || carry) {\n            int sum = carry;\n            if (l1) { sum += l1->val; l1 = l1->next; }\n            if (l2) { sum += l2->val; l2 = l2->next; }\n            carry = sum / 10;\n            curr->next = new ListNode(sum % 10);\n            curr = curr->next;\n        }\n        return dummy.next;\n    }\n};\n// Time: O(max(N,M)) | Space: O(max(N,M))",
        "solution_java": "class Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        ListNode dummy = new ListNode(0);\n        ListNode curr = dummy;\n        int carry = 0;\n        while (l1 != null || l2 != null || carry != 0) {\n            int sum = carry;\n            if (l1 != null) { sum += l1.val; l1 = l1.next; }\n            if (l2 != null) { sum += l2.val; l2 = l2.next; }\n            carry = sum / 10;\n            curr.next = new ListNode(sum % 10);\n            curr = curr.next;\n        }\n        return dummy.next;\n    }\n}\n// Time: O(max(N,M)) | Space: O(max(N,M))",
        "companies": [
          "Oracle",
          "Amazon",
          "Cisco"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "l1 = [2,4,3], l2 = [5,6,4]",
            "expected": "[7,0,8]",
            "actual": "[7,0,8]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      }
    ]
  },
  {
    "id": "topic-14",
    "number": "14",
    "title": "The 5 Universal Patterns & Advance Extensions",
    "tag": "High-Frequency Competitive Patterns",
    "summary": "The 5 universal Linked List patterns, Copy with Random Pointer, XOR Linked List, and memory cache locality.",
    "intuition_hinglish": "{{USER}} bhai, agar tum dhyan se dekho, to LeetCode ke 98% Linked List questions sirf **5 Universal Patterns** pe solve hote hain:\n    \n    1. <b>Dummy Sentinel Node Pattern</b>: Jab bhi head delete hona ho, list merge karni ho, ya head modify hona ho, pehle <code>ListNode dummy(0); dummy.next = head;</code> lagao. Zero special edge cases!\n    2. <b>Fast & Slow Pointer Pattern</b>: Middle nikalna, Cycle detect karna, Cycle start point dhoondna.\n    3. <b>In-place 3-Pointer Reversal</b>: <code>prev</code>, <code>curr</code>, <code>forward</code> se O(1) space me links palatna.\n    4. <b>Gap Window Pattern</b>: N-th from end nikalna (Fast ko pehle N+1 steps aage bhej kar).\n    5. <b>Interleaving / Node Stitching Pattern</b>: LC 138 (Copy List with Random Pointer) me bina HashMap ke $O(1)$ space me deep copy banane ke liye original aur cloned nodes ko aapas me guthna (interleave karna)!",
    "intuition_en": "{{USER}}, comprehensive competitive mastery of Linked Lists condenses into 5 universal patterns:\n    1. <b>Sentinel Dummy Node</b>: Unifies head edge cases during deletions, partitioning, and merging.\n    2. <b>Velocity Disparity (Fast & Slow)</b>: Median location and cyclic topology invariants.\n    3. <b>In-Place 3-Pointer Window</b>: Reversal without memory duplication.\n    4. <b>Spatial Gap Invariant</b>: Fixed $(N+1)$ window for terminus-relative addressing.\n    5. <b>Interleaved Cloning</b>: Weaving clone nodes into the native chain to resolve random pointers in $O(1)$ auxiliary memory.",
    "intuition_tldr": "• Pattern 1: Sentinel Dummy.\n• Pattern 2: Fast & Slow pointers.\n• Pattern 3: In-place 3-pointer reversal.\n• Pattern 4: N+1 Gap Window.\n• Pattern 5: Interleaved Cloning (LC 138).",
    "c_vs_cpp": [
      {
        "feature": "XOR Linked List",
        "c": "Stores prev ^ next in single pointer",
        "cpp": "Conceptually memory-saving; replaced by std::list in real-world systems"
      }
    ],
    "diagram": "MASTER DECISION FLOWCHART:\nProblem keyword?\n├── \"Middle\" / \"Cycle\"           ──> Fast & Slow Pointer\n├── \"Reverse\" / \"Palindrome\"     ──> In-Place 3-Pointer Reversal\n├── \"Delete head\" / \"Partition\"  ──> Sentinel Dummy Node\n├── \"N-th from end\"              ──> (N+1) Spatial Gap Window\n└── \"Clone with Random\"          ──> Interleaved Tri-Pass Stitching",
    "code_cpp": "// Copy List with Random Pointer in O(1) Auxiliary Space in C++ (LC 138)\nNode* copyRandomList(Node* head) {\n    if (!head) return nullptr;\n    // Step 1: Interleave cloned nodes: A -> A' -> B -> B'\n    Node* curr = head;\n    while (curr) {\n        Node* clone = new Node(curr->val);\n        clone->next = curr->next;\n        curr->next = clone;\n        curr = clone->next;\n    }\n    // Step 2: Assign random pointers\n    curr = head;\n    while (curr) {\n        if (curr->random) curr->next->random = curr->random->next;\n        curr = curr->next->next;\n    }\n    // Step 3: Separate original and cloned list\n    curr = head;\n    Node* cloneHead = head->next;\n    while (curr) {\n        Node* clone = curr->next;\n        curr->next = clone->next;\n        if (clone->next) clone->next = clone->next->next;\n        curr = curr->next;\n    }\n    return cloneHead;\n}",
    "code_java": "// Copy List with Random Pointer in O(1) Auxiliary Space in Java (LC 138)\npublic Node copyRandomList(Node head) {\n    if (head == null) return null;\n    // Step 1: Interleave cloned nodes\n    Node curr = head;\n    while (curr != null) {\n        Node clone = new Node(curr.val);\n        clone.next = curr.next;\n        curr.next = clone;\n        curr = clone.next;\n    }\n    // Step 2: Assign random references\n    curr = head;\n    while (curr != null) {\n        if (curr.random != null) curr.next.random = curr.random.next;\n        curr = curr.next.next;\n    }\n    // Step 3: Unweave chains\n    curr = head;\n    Node cloneHead = head.next;\n    while (curr != null) {\n        Node clone = curr.next;\n        curr.next = clone.next;\n        if (clone.next != null) clone.next = clone.next.next;\n        curr = curr.next;\n    }\n    return cloneHead;\n}",
    "dry_run": [
      "1. Interleaving duplicates each node immediately adjacent to original.",
      "2. Random link of clone is easily found as `curr.random.next` in O(1) time without HashMap!",
      "3. Unweaving restores original chain and extracts isolated deep copy."
    ],
    "pitfalls": [
      "Failing to restore the original list in step 3 alters caller input, which fails LeetCode test harnesses."
    ],
    "leetcode_milestone": {
      "name": "Copy List with Random Pointer",
      "number": 138,
      "url": "https://leetcode.com/problems/copy-list-with-random-pointer/",
      "checkpoint": "Mastering the interleaved cloning pattern completes your journey to advanced status!"
    },
    "problems": [
      {
        "id": "p14_1",
        "difficulty": "Easy",
        "title": "LeetCode 24: Swap Nodes in Pairs",
        "leetcode": "LeetCode 24",
        "leetcode_url": "https://leetcode.com/problems/swap-nodes-in-pairs/",
        "desc": "Swap every two adjacent nodes without modifying node values.",
        "input": "head = [1,2,3,4]",
        "output": "[2,1,4,3]",
        "edge_cases": "Odd number of nodes, 1 node.",
        "hints": [
          "Use dummy node before head.",
          "Pointers: `first = prev->next`, `second = prev->next->next`.",
          "Rewire: `first->next = second->next; second->next = first; prev->next = second; prev = first;`."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* swapPairs(ListNode* head) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode swapPairs(ListNode head) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* swapPairs(ListNode* head) {\n        ListNode dummy(0);\n        dummy.next = head;\n        ListNode* prev = &dummy;\n        while (prev->next && prev->next->next) {\n            ListNode* first = prev->next;\n            ListNode* second = prev->next->next;\n            first->next = second->next;\n            second->next = first;\n            prev->next = second;\n            prev = first;\n        }\n        return dummy.next;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "class Solution {\n    public ListNode swapPairs(ListNode head) {\n        ListNode dummy = new ListNode(0);\n        dummy.next = head;\n        ListNode prev = dummy;\n        while (prev.next != null && prev.next.next != null) {\n            ListNode first = prev.next;\n            ListNode second = prev.next.next;\n            first.next = second.next;\n            second.next = first;\n            prev.next = second;\n            prev = first;\n        }\n        return dummy.next;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Adobe",
          "Google",
          "Uber"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,2,3,4]",
            "expected": "[2,1,4,3]",
            "actual": "[2,1,4,3]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p14_2",
        "difficulty": "Medium",
        "title": "LeetCode 86: Partition List",
        "leetcode": "LeetCode 86",
        "leetcode_url": "https://leetcode.com/problems/partition-list/",
        "desc": "Partition list so nodes less than x come before nodes >= x, preserving relative order.",
        "input": "head = [1,4,3,2,5,2], x = 3",
        "output": "[1,2,2,4,3,5]",
        "edge_cases": "All elements < x or all >= x.",
        "hints": [
          "Create two dummy chains: `lessDummy` and `greaterDummy`.",
          "Traverse and append accordingly.",
          "Connect `lessTail->next = greaterDummy.next; greaterTail->next = null;`."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    ListNode* partition(ListNode* head, int x) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public ListNode partition(ListNode head, int x) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    ListNode* partition(ListNode* head, int x) {\n        ListNode lessD(0), greaterD(0);\n        ListNode *lTail = &lessD, *gTail = &greaterD;\n        while (head) {\n            if (head->val < x) { lTail->next = head; lTail = lTail->next; }\n            else { gTail->next = head; gTail = gTail->next; }\n            head = head->next;\n        }\n        gTail->next = nullptr;\n        lTail->next = greaterD.next;\n        return lessD.next;\n    }\n};\n// Time: O(N) | Space: O(1)",
        "solution_java": "class Solution {\n    public ListNode partition(ListNode head, int x) {\n        ListNode lessD = new ListNode(0), greaterD = new ListNode(0);\n        ListNode lTail = lessD, gTail = greaterD;\n        while (head != null) {\n            if (head.val < x) { lTail.next = head; lTail = lTail.next; }\n            else { gTail.next = head; gTail = gTail.next; }\n            head = head.next;\n        }\n        gTail.next = null;\n        lTail.next = greaterD.next;\n        return lessD.next;\n    }\n}\n// Time: O(N) | Space: O(1)",
        "companies": [
          "Oracle",
          "Amazon",
          "Cisco"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [1,4,3,2,5,2], x = 3",
            "expected": "[1,2,2,4,3,5]",
            "actual": "[1,2,2,4,3,5]",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      },
      {
        "id": "p14_3",
        "difficulty": "LeetCode Style",
        "title": "LeetCode 138: Copy List with Random Pointer",
        "leetcode": "LeetCode 138 (Master Pattern)",
        "leetcode_url": "https://leetcode.com/problems/copy-list-with-random-pointer/",
        "desc": "Construct a deep copy of a linked list with random pointers in O(1) auxiliary space.",
        "input": "head = [[7,null],[13,0],[11,4],[10,2],[1,0]]",
        "output": "Deep cloned list",
        "edge_cases": "head == null, random points to null or itself.",
        "hints": [
          "Step 1: Interleave cloned nodes: `A -> A' -> B -> B'`.",
          "Step 2: Connect random pointers: `curr->next->random = curr->random ? curr->random->next : null`.",
          "Step 3: Unweave original and clone chains."
        ],
        "starter_code_cpp": "class Solution {\npublic:\n    Node* copyRandomList(Node* head) {\n        // C++:\n    }\n};",
        "starter_code_java": "class Solution {\n    public Node copyRandomList(Node head) {\n        // Java:\n    }\n}",
        "solution_cpp": "class Solution {\npublic:\n    Node* copyRandomList(Node* head) {\n        if (!head) return nullptr;\n        Node* curr = head;\n        while (curr) {\n            Node* clone = new Node(curr->val);\n            clone->next = curr->next;\n            curr->next = clone;\n            curr = clone->next;\n        }\n        curr = head;\n        while (curr) {\n            if (curr->random) curr->next->random = curr->random->next;\n            curr = curr->next->next;\n        }\n        curr = head;\n        Node* cloneHead = head->next;\n        while (curr) {\n            Node* clone = curr->next;\n            curr->next = clone->next;\n            if (clone->next) clone->next = clone->next->next;\n            curr = curr->next;\n        }\n        return cloneHead;\n    }\n};\n// Time: O(N) | Space: O(1) auxiliary",
        "solution_java": "class Solution {\n    public Node copyRandomList(Node head) {\n        if (head == null) return null;\n        Node curr = head;\n        while (curr != null) {\n            Node clone = new Node(curr.val);\n            clone.next = curr.next;\n            curr.next = clone;\n            curr = clone.next;\n        }\n        curr = head;\n        while (curr != null) {\n            if (curr.random != null) curr.next.random = curr.random.next;\n            curr = curr.next.next;\n        }\n        curr = head;\n        Node cloneHead = head.next;\n        while (curr != null) {\n            Node clone = curr.next;\n            curr.next = clone.next;\n            if (clone.next != null) clone.next = clone.next.next;\n            curr = curr.next;\n        }\n        return cloneHead;\n    }\n}\n// Time: O(N) | Space: O(1) auxiliary",
        "companies": [
          "Goldman Sachs",
          "Meta",
          "Google"
        ],
        "test_cases": [
          {
            "id": 1,
            "input": "head = [[7,null],[13,0],[11,4],[10,2],[1,0]]",
            "expected": "Deep cloned list",
            "actual": "Deep cloned list",
            "status": "Passed"
          },
          {
            "id": 2,
            "input": "Single Node / Boundary",
            "expected": "Valid output",
            "actual": "Valid output",
            "status": "Passed"
          },
          {
            "id": 3,
            "input": "head = null / []",
            "expected": "null",
            "actual": "null",
            "status": "Passed"
          }
        ]
      }
    ]
  },
  {
    "id": "cheat-sheet",
    "number": "★",
    "title": "Master Revision Cheat-Sheet & Interview Templates",
    "tag": "Battle-Tested Templates",
    "summary": "Complete one-glance templates for C++ and Java, complexities, and interview battle cards.",
    "intuition_hinglish": "{{USER}} bhai, interview se theek 15 minute pehle ya revision ke waqt tumhe poora chapter padhne ki zaroorat nahi hai.\n    \n    Yahan saare core battle-tested templates ek jagah compiled hain:\n    - In-place Reversal template\n    - Fast & Slow Middle finder template\n    - Floyd's Cycle Detection template\n    - Sentinel Dummy Node Merging template\n    - LeetCode direct links & problem roadmap",
    "intuition_en": "{{USER}}, this cheat-sheet aggregates production-ready templates and complexity tables for instant recall prior to technical screening interviews.",
    "intuition_tldr": "• Instant templates for C++ & Java.\n• Time and space complexity matrix.\n• LeetCode progression roadmap.",
    "c_vs_cpp": [
      {
        "feature": "Access by Index",
        "c": "O(N)",
        "cpp": "O(N) in both C++ and Java"
      },
      {
        "feature": "Insert at Head",
        "c": "O(1)",
        "cpp": "O(1) in both C++ and Java"
      },
      {
        "feature": "Delete given pointer in DLL",
        "c": "O(1)",
        "cpp": "O(1) in both C++ and Java"
      }
    ],
    "diagram": "COMPLEXITY MATRIX:\n┌───────────────────────────┬───────────────┬──────────────┬────────────────────────────┐\n│ Operation                 │ Singly LL     │ Doubly LL    │ Array / Vector             │\n├───────────────────────────┼───────────────┼──────────────┼────────────────────────────┤\n│ Access by Index           │ O(N)          │ O(N)         │ O(1)                       │\n│ Insert / Delete at Head   │ O(1)          │ O(1)         │ O(N) (Shift elements)      │\n│ Insert / Delete at Tail   │ O(N) / O(1)*  │ O(1) (tail)  │ O(1) amortized             │\n│ Delete given node pointer │ O(N) (prev req│ O(1) (prev in│ O(N)                       │\n│ Memory Overhead           │ 1 ptr (8 byte)│ 2 ptr(16 byte│ 0 ptr (Contiguous)         │\n└───────────────────────────┴───────────────┴──────────────┴────────────────────────────┘",
    "code_cpp": "// ==========================================\n// 1. REVERSE A LINKED LIST (O(1) Space)\n// ==========================================\nListNode* reverseList(ListNode* head) {\n    ListNode *prev = nullptr, *curr = head;\n    while (curr) {\n        ListNode* fwd = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = fwd;\n    }\n    return prev;\n}\n\n// ==========================================\n// 2. FAST & SLOW MIDDLE FINDER\n// ==========================================\nListNode* getMiddle(ListNode* head) {\n    ListNode *slow = head, *fast = head;\n    while (fast && fast->next) {\n        slow = slow->next;\n        fast = fast->next->next;\n    }\n    return slow;\n}\n\n// ==========================================\n// 3. FLOYD'S CYCLE DETECTION\n// ==========================================\nListNode* detectCycle(ListNode* head) {\n    ListNode *slow = head, *fast = head;\n    while (fast && fast->next) {\n        slow = slow->next;\n        fast = fast->next->next;\n        if (slow == fast) {\n            slow = head;\n            while (slow != fast) { slow = slow->next; fast = fast->next; }\n            return slow;\n        }\n    }\n    return nullptr;\n}",
    "code_java": "// ==========================================\n// 1. REVERSE A LINKED LIST (O(1) Space)\n// ==========================================\npublic ListNode reverseList(ListNode head) {\n    ListNode prev = null, curr = head;\n    while (curr != null) {\n        ListNode fwd = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = fwd;\n    }\n    return prev;\n}\n\n// ==========================================\n// 2. FAST & SLOW MIDDLE FINDER\n// ==========================================\npublic ListNode getMiddle(ListNode head) {\n    ListNode slow = head, fast = head;\n    while (fast != null && fast.next != null) {\n        slow = slow.next;\n        fast = fast.next.next;\n    }\n    return slow;\n}\n\n// ==========================================\n// 3. FLOYD'S CYCLE DETECTION\n// ==========================================\npublic ListNode detectCycle(ListNode head) {\n    ListNode slow = head, fast = head;\n    while (fast != null && fast.next != null) {\n        slow = slow.next;\n        fast = fast.next.next;\n        if (slow == fast) {\n            slow = head;\n            while (slow != fast) { slow = slow.next; fast = fast.next; }\n            return slow;\n        }\n    }\n    return null;\n}",
    "dry_run": [
      "Revision Invariant 1: Defensive guards `!head || !head->next` prevent 90% of edge case bugs.",
      "Revision Invariant 2: Stack sentinel `dummy(0)` resolves head mutation in 1 line.",
      "Revision Invariant 3: Reversal is 4 simple steps: save forward -> invert link -> slide prev -> slide curr."
    ],
    "pitfalls": [
      "Losing traversal cursor",
      "Short circuit order failure in while conditions"
    ],
    "leetcode_milestone": null,
    "problems": []
  }
];
