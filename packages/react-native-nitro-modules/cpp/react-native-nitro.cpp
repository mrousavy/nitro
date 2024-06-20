#include "react-native-nitro.hpp"

#include <swift/bridging>
#include "NitroModules-Swift.h"

namespace nitro {
	double multiply(double a, double b) {
    auto exampleClass = NitroModules::HybridObject::init("Heyo!");

		return a * b;
	}
}
