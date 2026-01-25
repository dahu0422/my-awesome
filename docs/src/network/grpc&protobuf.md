# gRPC & Protocol Buffers

## RPC
RPC（Remote Procedure Call，远程过程调用）是一种通信协议，允许程序调用远程服务器上的函数，就像调用本地函数一样。

## gRPC

gRPC 是由 Google 开源的一款**高性能、跨语言、基于 HTTP/2 和 Protocol Buffers (Protobuf)** 的远程过程调用（RPC）框架。

它是一套完整的 RPC 解决方案：包含了数据序列化、传输协议、接口定义、代码生成、服务治理等全套能力。

### gRPC 核心依赖（为什么能这么高效？）

gRPC 的优势完全依赖于两大核心技术，也是它和传统 REST API 的核心区别：

#### 1. 数据序列化：Protocol Buffers（Protobuf）

它是 gRPC 的“数据格式基础，特点：

- 二进制序列化：相比 JSON/XML 的文本格式，体积小（通常是 JSON 的 1/3 ~ 1/10）、解析快（CPU 开销低）；
- 强类型：.proto 里定义的数据结构是强类型的（如 int32、string），编译时就能发现类型错误，避免运行时问题；
- 跨语言：一份 .proto 文件，可通过 protoc 编译器生成 Java、Go、Python、C++、Node.js 等几乎所有主流语言的代码；
- 版本兼容：支持字段的增删改，新旧版本服务可兼容（比如新增字段不影响旧客户端）；

#### 2.传输协议：HTTP/2

gRPC 基于 HTTP/2 实现，这是它 “高性能” 的另一核心原因（传统 REST API 多基于 HTTP/1.1）：

- 多路复用：单个 TCP 连接可同时处理多个请求 / 响应，避免 HTTP/1.1 的 “队头阻塞” 问题，大幅提升并发效率。
- 二进制帧：HTTP/2 采用二进制格式传输，解析效率远高于 HTTP/1.1 的文本格式。
- 头部压缩：对 HTTP 头部进行 HPACK 压缩，减少重复头部的传输开销。
- 服务端推送：支持服务端主动向客户端推送数据（gRPC 的流式通信依赖此特性）


### gRPC 的四种通信方式

| 类型                                | 描述                             |
| :---------------------------------- | :------------------------------- |
| 一元 RPC（Unary RPC）               | 类似传统请求-响应                |
| 服务器流式（Server Streaming）      | 客户端发送一个请求，服务端返回流 |
| 客户端流式（Client Streaming）      | 客户端发送流，服务端返回一个响应 |
| 双向流式（Bidirectional Streaming） | 双向流                           |

```protobuf
syntax = "proto3";
package demo;

// 定义服务
service DataService {
  // 1. 简单 RPC
  rpc GetSingleData (SingleRequest) returns (SingleResponse);

  // 2. 服务端流式 RPC（返回值加 stream）
  rpc GetServerStreamData (SingleRequest) returns (stream SingleResponse);

  // 3. 客户端流式 RPC（请求参数加 stream）
  rpc GetClientStreamData (stream SingleRequest) returns (SingleResponse);

  // 4. 双向流式 RPC（请求和返回都加 stream）
  rpc GetBidirectionalStreamData (stream SingleRequest) returns (stream SingleResponse);
}

// 通用请求结构
message SingleRequest {
  int32 id = 1;
  string content = 2;
}

// 通用响应结构
message SingleResponse {
  int32 code = 1;
  string message = 2;
  string data = 3;
}
```

## Protocol Buffers

Protobuf 是 Google 开源的**语言中立、平台中立、可扩展的结构化数据序列化机制**（你可以把它理解为 “高效的二进制数据打包工具”），和 JSON、XML 是同一类东西，但设计目标完全不同 ——JSON/XML 追求 “人易读”，Protobuf 追求 “机器高效解析 + 体积小”

核心设计理念

- 二进制优先：放弃文本的可读性，用二进制编码极致压缩数据体积、提升解析速度。
- 强类型契约：通过 .proto 文件定义数据结构，编译时校验类型，避免运行时数据错误。
- 向后兼容：支持字段的增删改，新旧版本程序可无缝兼容（核心优势之一）。
- 跨语言：一份 .proto 定义，可生成几乎所有主流语言（Python/Java/Go/C++/Node.js 等）的代码。

### Protobug 工作流程（从定义到使用）

Protobuf 的使用分为“定义-编译-序列化/反序列化”三步

#### 编写 `.proto` 文件（定义数据结构）

`.proto` 是 Protocol Buffers（简称Protobuf）的定义文件，也是 gRPC 实现跨语言、强类型通信的核心载体。可以理解为：所有参与通信的服务/客户端都必须遵守的“标准化合同”。

`.proto`的核心构成（以Proto3为，目前主流版本）

```protobuf
// 1. 声明 proto 版本（必须放在第一行，proto3 是推荐版本）
syntax = "proto3";

// 2. 声明包名（避免命名冲突，类似编程语言的命名空间）
package user_service;

// 3. 可选：指定生成代码的包路径（不同语言有不同写法）
// 例如 Python 无需此配置，Java 需要：
// option java_package = "com.example.grpc";
// option java_outer_classname = "UserServiceProto"; // 生成的 Java 外层类名

// 4. 定义数据结构（Message）：通信的“数据载体”
// 类似编程语言的结构体/类，每个字段有“类型 + 名称 + 唯一编号”
message User {
  // 字段规则：
  // - proto3 中默认是 optional（可选），无需显式声明
  // - 字段编号（=1、=2）：用于二进制序列化，一旦定义不要修改！
  int32 id = 1;          // 整型（32位）
  string name = 2;       // 字符串
  string email = 3;      // 字符串
  repeated string tags = 4; // repeated：表示数组/列表（可重复字段）
  bool is_active = 5;    // 布尔值
  float score = 6;       // 浮点型
  // 枚举类型：限定字段取值范围
  UserType type = 7;
}

// 定义枚举类型
enum UserType {
  // 枚举值必须从 0 开始（proto3 要求）
  USER_TYPE_UNSPECIFIED = 0; // 默认值
  USER_TYPE_NORMAL = 1;
  USER_TYPE_VIP = 2;
}

// 5. 定义请求/响应结构体（针对具体接口）
message GetUserRequest {
  int32 user_id = 1;
}

message GetUserResponse {
  int32 code = 1;
  string message = 2;
  User data = 3; // 嵌套使用上面定义的 User 结构体
}

// 6. 定义服务接口（Service）：gRPC 的核心，规定可调用的方法
service UserService {
  // 简单 RPC：单次请求-单次响应
  rpc GetUser (GetUserRequest) returns (GetUserResponse);
  // 服务端流式 RPC：返回值加 stream
  rpc ListAllUsers (EmptyRequest) returns (stream User);
}

// 空请求（无参数时使用）
message EmptyRequest {}
``` 

#### 编译 `.proto` 文件

`.proto` 本身无法直接被代码调用，必须通过 **protoc 编译器**生成对应语言的代码

```bash
# 安装运行时依赖（生产环境需要）
npm install @grpc/grpc-js google-protobuf

# 安装开发依赖（编译 proto 文件需要）
npm install --save-dev grpc-tools grpc_tools_node_protoc_ts typescript @types/node
```
