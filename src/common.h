#ifndef OPENCL_COMMON_H_
#define OPENCL_COMMON_H_

// Node includes
#include <node.h>
#include "nan.h"
#include <string>
#include <memory>
#include <vector>
#ifdef LOGGING
#include <iostream>
#endif

using namespace std;
using namespace v8;

// OpenCL includes
#define CL_USE_DEPRECATED_OPENCL_1_1_APIS

#if defined (__APPLE__) || defined(MACOSX)
  #ifdef __ECLIPSE__
    #include <gltypes.h>
    #include <gl3.h>
    #include <cl_platform.h>
    #include <cl.h>
    #include <cl_gl.h>
    #include <cl_gl_ext.h>
    #include <cl_ext.h>
  #else
    #include <OpenGL/gl3.h>
    #include <OpenGL/gl3ext.h>
    #include <OpenGL/OpenGL.h>
    #include <OpenCL/opencl.h>
    #define CL_GL_CONTEXT_KHR 0x2008
    #define CL_EGL_DISPLAY_KHR 0x2009
    #define CL_INVALID_GL_SHAREGROUP_REFERENCE_KHR CL_INVALID_GL_CONTEXT_APPLE
  #endif
  #define HAS_clGetContextInfo
#elif defined(_WIN32)
    #include <GL/gl.h>
    #include <CL/opencl.h>
    #define strcasecmp _stricmp
    #define strncasecmp _strnicmp
    char *strcasestr(const char *s, char *find);
#else
    #include <GL/gl.h>
    #include <GL/glx.h>
    #include <CL/opencl.h>
#endif

#ifndef CL_CURRENT_DEVICE_FOR_GL_CONTEXT_KHR
  #define CL_CURRENT_DEVICE_FOR_GL_CONTEXT_KHR 0x2006
#endif
#ifndef CL_DEVICES_FOR_GL_CONTEXT_KHR
  #define CL_DEVICES_FOR_GL_CONTEXT_KHR 0x2007
#endif

namespace {
#define JS_STR(...) NanNew<v8::String>(__VA_ARGS__)
#define JS_INT(val) NanNew<v8::Integer>(val)
#define JS_NUM(val) NanNew<v8::Number>(val)
#define JS_BOOL(val) NanNew<v8::Boolean>(val)
#define JS_RETHROW(tc) NanNew<v8::Local<v8::Value> >(tc.Exception());

#define CHECK_ERR(ret)  { cl_int _err=(ret); \
  if ((_err) != CL_SUCCESS) { \
    return NanThrowError(JS_INT(_err)); \
  } \
}

#define REQ_ARGS(N)                                                     \
  if (args.Length() < (N)) {                                            \
    NanThrowTypeError("Expected " #N " arguments");                     \
  }

#define REQ_STR_ARG(I, VAR)                                             \
  if (args.Length() <= (I) || !args[I]->IsString())                     \
    NanThrowTypeError("Argument " #I " must be a string");              \
  String::Utf8Value VAR(args[I]->ToString());

#define REQ_EXT_ARG(I, VAR)                                             \
  if (args.Length() <= (I) || !args[I]->IsExternal())                   \
    NanThrowTypeError("Argument " #I " invalid");                       \
  Local<External> VAR = Local<External>::Cast(args[I]);

#define REQ_FUN_ARG(I, VAR)                                             \
  if (args.Length() <= (I) || !args[I]->IsFunction())                   \
    NanThrowTypeError("Argument " #I " must be a function");            \
  Local<Function> VAR = Local<Function>::Cast(args[I]);

} // namespace

namespace opencl {

const char* ErrorDesc(cl_int err);

inline bool isOpenCLObj(Local<Value> val) {
    return !(val->IsNull() || !val->IsObject() || val->IsArray() || val->ToObject()->InternalFieldCount()<1);
}

template<typename CL_TYPE>
inline CL_TYPE Unwrap(Local<Value> val) {
  Local<External> wrap = Local<External>::Cast(val->ToObject()->GetInternalField(0));
  return static_cast<CL_TYPE>(wrap->Value());
}

template<typename CL_TYPE>
inline Local<Object> Wrap(CL_TYPE param_value) {
  Local<ObjectTemplate> tpl = ObjectTemplate::New();
  tpl->SetInternalFieldCount(1);
  Local<Object> obj = tpl->NewInstance();
  obj->SetInternalField(0, External::New(param_value));
  return obj;
}

void getPtrAndLen(const Local<Value> value, void* &ptr, int &len);

template<typename CL_TYPE>
void getValuesFromArray(const Local<Array>& arr, std::vector<CL_TYPE>& vals);

} // namespace opencl

#endif // OPENCL_COMMON_H_