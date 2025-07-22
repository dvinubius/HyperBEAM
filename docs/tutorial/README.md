# HyperBEAM Tutorial Collection

This directory contains interactive tutorials and resources for learning HyperBEAM, designed for developers with web2/web3 experience who want to build applications using the AO-Core protocol.

## 📚 Tutorial Contents

### [Interactive Tutorial](hyperbeam-interactive-tutorial.md)
**Start here!** A comprehensive, hands-on tutorial that guides you through:

- Understanding HyperBEAM's core concepts
- Working with HyperPATHs and devices
- Reading and writing process state
- Using the patch device effectively
- Building web interfaces
- Production considerations

Perfect for developers who want to understand how HyperBEAM works and learn by doing.

### [Quick Reference](hyperbeam-quick-reference.md)
A condensed reference guide with:

- Essential command patterns
- Common curl examples
- JavaScript client snippets
- Troubleshooting tips
- Performance optimization

Great for bookmarking and referencing while building applications.

### [JavaScript Client Example](hyperbeam-client-example.js)
Production-ready JavaScript client code featuring:

- `HyperBEAMClient` class for HTTP interactions
- `ProcessClient` for process-specific operations
- `ProcessDashboard` for real-time monitoring
- Utility functions and best practices

Ready to copy-paste into your projects.

## 🎯 Learning Path

### For Beginners
1. Read the [Introduction to HyperBEAM](../introduction/what-is-hyperbeam.md)
2. Follow the [Interactive Tutorial](hyperbeam-interactive-tutorial.md) step by step
3. Bookmark the [Quick Reference](hyperbeam-quick-reference.md)

### For Experienced Developers
1. Skim the [Interactive Tutorial](hyperbeam-interactive-tutorial.md) for concepts
2. Use the [JavaScript Client Example](hyperbeam-client-example.js) as a starting point
3. Refer to the [Quick Reference](hyperbeam-quick-reference.md) as needed

### For Advanced Users
1. Explore the [device documentation](../devices/overview.md)
2. Study the [source code](../../src/) for implementation details
3. Consider building custom devices for your use cases

## 🔧 Prerequisites

- A running HyperBEAM node (local or remote access)
- Basic understanding of HTTP/REST APIs
- An AO process ID (if you want to follow the process examples)
- `curl` or your favorite HTTP client

## 🚀 Quick Start

1. **Test your setup:**
   ```bash
   curl http://localhost:10000/~meta@1.0/info
   ```

2. **Try your first HyperPATH:**
   ```bash
   curl 'http://localhost:10000/~message@1.0?greeting=Hello&count+integer=42/greeting'
   ```

3. **Follow the interactive tutorial for more!**

## 💡 Key Concepts

- **Messages**: Data structures that can contain functions and data
- **Devices**: Computational engines that process messages
- **HyperPATHs**: URLs that represent computation chains
- **Process**: Persistent, stateful execution environment
- **Patch Device**: Mechanism for exposing process state via HTTP

## 🔗 Related Documentation

- [HyperBEAM Overview](../introduction/what-is-hyperbeam.md)
- [AO-Core Concepts](../introduction/what-is-ao-core.md)
- [Pathing in AO-Core](../introduction/pathing-in-ao-core.md)
- [Device Documentation](../devices/overview.md)
- [Installation Guide](../misc/installation-core/index.md)

## 🤝 Contributing

Found an issue or want to improve the tutorials? Please:

1. Check the existing documentation for answers
2. Create an issue in the HyperBEAM repository
3. Submit a pull request with improvements

## 📝 Feedback

These tutorials are designed to be practical and useful. If you:

- Get stuck on any step
- Find unclear explanations
- Have suggestions for improvement
- Want additional examples

Please let us know through the project's contribution channels.

---

**Happy learning!** 🎉

Start with the [Interactive Tutorial](hyperbeam-interactive-tutorial.md) and begin building with HyperBEAM today. 