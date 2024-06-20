#include "react-native-nitro.hpp"

#include <react-native-nitro-modules/react-native-nitro-modules-umbrella.h>
#include <swift/bridging>
#include "NitroModules-Swift.h"

namespace nitro {
	double multiply(double a, double b) {

		return a * b;
	}
}
