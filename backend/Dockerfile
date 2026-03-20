# 使用Maven镜像进行构建
FROM maven:3.8.5-openjdk-8 AS builder

# 设置工作目录
WORKDIR /app

# 复制pom.xml和源代码
COPY pom.xml ./
COPY src ./src

# 构建项目
RUN mvn clean package -DskipTests

# 使用Eclipse Temurin的OpenJDK 8 JRE镜像
FROM eclipse-temurin:8-jre-alpine

# 设置工作目录
WORKDIR /app

# 从构建阶段复制jar文件
COPY --from=builder /app/target/backend-1.0.0.jar ./app.jar

# 暴露端口
EXPOSE 8080

# 设置启动命令
CMD ["java", "-jar", "app.jar"]