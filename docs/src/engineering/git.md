# git 🚧

结合实际开发中遇到的场景问题，介绍各种命令的使用

## git 各个工作区

- 工作区 Working Directory：电脑上实际的文件

- 暂存区 Staging Area/Index：通过 `git add` 命令将文件从工作区添加到暂存区。记录了下次提交时要保存的文件更改

- 本地仓库 Local Repository：通过 `git commit` 命令将暂存区的内容提交到本地仓库，包含了项目所有历史记录和分支信息，有完整的版本控制。

- 远程仓库 Remote Repository：位于远程服务器上（如 GitLab、GitHub），通过 `git push` 将本地仓库的内容推送到远程仓库。通过 `git pull` 将远程仓库的内容拉取到本地。

## merge VS rebase

### merge

`merge` 将两个分支的提交历史合并，产生一条新的“合并提交（merge commit）”，分支历史保留所有分叉和合流记录。

```bash
A---B---C   (main)
     \
      D---E (feature)

git checkout main
git merge feature
```

合并后

```bash
A---B---C-------M  (main)
     \       /
      D---E (feature)
```

### rebase

`rebase` 将当前分支的提交**挪动到目标分支的后面**，是提交历史看起来像是线性的，不保留分叉点，重写历史。

```bash
A---B---C   (main)
     \
      D---E (feature)

git checkout feature
git rebase main
```

变成

```bash
A---B---C---D'---E'  (feature rebased)
```

D' 和 E' 是新的提交，相当于 D 和 E 的“复制”版本

## 删除本地分支，重新同步远程分支

团队协作中有时会遇到分支清洗，清洗过后我们本地分支与远程有很大出入，这时候我会采用这种方式。

删除本地分支

```bash
git branch -D dev
```

从远程获取最新信息

```bash
git fetch origin
```

重新创建并切换到 dev 分支

```bash
git checkout -b dev origin/dev
```

## 修改最新提交 message

`git commit --amend` 打开 vim 编译器，修改提交信息。

`git commit --amend -m '新的提交信息'` 在命令行中修改，不打开编辑器。

## 临时保存修改

`git stash` 临时保存工作目录和暂存区的修改。

比如在当前分支有未提交修改，但是需要切换到其他分支时。需要暂时搁置当前工作去处理。

| 命令                        | 作用                                      |
| --------------------------- | ----------------------------------------- |
| git stash \ git stash push  | 存储当前修改                              |
| git stash -u                | 存储并包含未跟踪的文件                    |
| git stash list              | 查看存储列表                              |
| git stash pop               | 应用最近一次保存的 stash 并将其从栈中删除 |
| git stash pop <stash 编号>  | 应用指定的 stash 并将其从栈中删除         |
| git stash drop              | 删除最近一次保存的 stash                  |
| git stash drop <stash 编号> | 删除指定的 stash                          |
| git stash clear             | 删除栈中所有的 stash                      |
| git stash clear             | 删除栈中所有的 stash                      |
| git stash show              | 查看最近一次 stash 差异                   |
| git stash show <stash 编号> | 查看指定 stash 差异                       |

## 撤销上一次提交记录

### 撤销提交但保留所有更改在工作目录中

```bash
git reset --soft HEAD~1
```

这个命令的作用是将 HEAD 指针回退到上一个提交，但保留工作区和暂存区。本地分支会比远程落后一个分支。

如果需要推送到远程，需要使用 `git push --force` 强制推送，可能会影响其它协作者。

### 反向提交（用于已推送的提交）

如果提交已经推送到远程分支，最好创建一个反向提交。这会创建一个新的提交，撤销前一个提交的更改，而不会重写历史记录。

```bash
git revert HEAD
```

## 脚手架初始化项目后 git 仓库管理混乱问题

### 问题情况

在使用 UmiJS 脚手架在已有项目目录（my-demos）下创建新项目（umijs）时，发现源代码管理出现了多个 Git 仓库，或者新建的项目目录没有被父目录的仓库捕获到。

### 原因

UmiJS 脚手架会自动在新创建的项目目录下执行 `git init`，生成独立的 `.git` 仓库。IDE 会自动检测当前工作区的所有 `.git` 仓库，导致显示多个仓库。父目录的 Git 仓库不会管理子目录下的文件变更，因为子目录有独立的 `.git` 仓库。

检查仓库结构

```bash
ls -a

ls -a umijs
```

检查 `my-demo` 和 `my-demo/umijs` 下是否都存在 `.git` 文件

### 解决方法

1. 删除子目录下的 `.git` 仓库 `rm -rf 文件目录/.git`

2. 添加并提交变更

```bash
git add umijs
git status
git commit -m "feat: 初始化 umijs 项目"
```

## 放弃被 git 追踪文件

```bash
git rm --cached -r xxx
git commit -m "remove tracked xxx"
```

## 推荐学习资源

官方文档：[Git Book](https://git-scm.com/book/en/v2)  
可视化工具：[Learn Gut Branching](https://learngitbranching.js.org/?locale=zh_CN)  
提交规范: [Conventional Commits](https://www.conventionalcommits.org/)
